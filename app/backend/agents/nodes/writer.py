from langchain_core.messages import HumanMessage, SystemMessage

from ..llm_connection import extract_usage_metadata, llm_connection, merge_usage
from ..prompts import build_writer_prompt
from ..state import AgentState

llm = llm_connection()


def writer_node(state: AgentState):
    """
    Reads full AgentState; builds draft mainly from researcher.facts and the PRD.
    """
    prd_content = state["prd"]
    target_audience = state.get("target_audience") or "b2c"
    researcher_blob = state.get("researcher") or {}
    checker_blob = state.get("fastChecker") or {}
    facts: list[str] = researcher_blob.get("facts") or []
    researcher_context = researcher_blob.get("context") or ""
    failed_facts: list[str] = checker_blob.get("failed_facts") or []

    facts_block = (
        "\n".join(f"- {f}".strip() for f in facts)
        if facts
        else "(No facts; draft from PRD only.)"
    )

    failed_facts_block = (
        "\n".join(f"- {f}".strip() for f in failed_facts)
        if failed_facts
        else ""
    )

    if failed_facts_block:
        messages = [
            SystemMessage(
                content=(
                    f"{build_writer_prompt(target_audience)}\n\n" #prompt if failed facts
                    "The previous version had factual issues. Rewrite the draft fixing the "
                    "failed facts listed below. Correct or remove unsupported claims. "
                    "Keep the blog post format and non-technical tone."
                ),
            ),
            HumanMessage(
                content=(
                    f"## Brief researcher context\n{researcher_context}\n\n"
                    f"## PRD\n{prd_content}\n\n"
                    "## Research facts (primary support)\n"
                    f"{facts_block}\n\n"
                    "## FAILED FACTS TO FIX\n"
                    f"{failed_facts_block}"
                ),
            ),
        ]
    else:
        messages = [
            SystemMessage(
                content=build_writer_prompt(target_audience), #prompt is not failedfacts
            ),
            HumanMessage(
                content=(
                    f"## Brief researcher context\n{researcher_context}\n\n"
                    f"## PRD\n{prd_content}\n\n"
                    "## Research facts (primary support)\n"
                    f"{facts_block}"
                ),
            ),
        ]

    usage_delta = {"input": 0, "output": 0}
    draft = ""

    if llm:
        reply = llm.invoke(messages)
        draft = getattr(reply, "content", str(reply)).strip()
        usage_delta = extract_usage_metadata(reply)
    else:
        draft = "(Writer skipped: LLM not configured.)"

    prev = state.get("writer") or {}
    attempts = int(prev.get("retry_count") or 0)
    print("AI DRAFT GENERATED:\n", draft)
    metrics = merge_usage(dict(state), usage_delta)
    return {
        "writer": {
            "draft": draft,
            "retry_count": attempts + 1,
        },
        "current_agent": state.get("current_agent"),
        **metrics,
    }
