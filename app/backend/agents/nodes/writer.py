from langchain_core.messages import HumanMessage, SystemMessage

from ..llm_connection import llm_connection
from ..state import AgentState

llm = llm_connection()


def writer_node(state: AgentState):
    """
    Reads full AgentState; builds draft mainly from researcher.facts and the PRD.
    """
    prd_content = state["prd"]
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
                    "Expert technical writer. Rewrite the draft in Spanish using checker feedback. "
                    "Correct or remove unsupported claims listed in FAILED FACTS. "
                    "Keep the output complete, structured, and grounded in PRD+facts only."
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
    else: # if not failed_facts_block (the first workflow)
        messages = [
            SystemMessage(
                content=(
                    "Expert technical writer. Output a complete, structured draft in English, "
                    "faithful to the PRD and grounded in the supplied research facts. "
                    "Do not add claims beyond PRD+facts."
                ),
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

    #if failed_facts_block we pass as argument to the llm

    reply = llm.invoke(messages)
    draft = getattr(reply, "content", str(reply)).strip()
    prev = state.get("writer") or {}
    attempts = int(prev.get("retry_count") or 0)
    print("AI DRAFT GENERATED:\n", draft)
    return {
        "writer": {
            "draft": draft,
            "retry_count": attempts + 1,
        },
        "current_agent": state.get("current_agent"),
    }
