from pydantic import BaseModel, Field

from ..llm_connection import extract_usage_metadata, llm_connection, merge_usage
from ..prompts import build_polisher_prompt
from ..state import AgentState
from ..validators import postprocess_polished_output, validate_polished_output


class PolisherOutput(BaseModel):
    final_post: str = Field(
        description="Final polished content with improved style and structure."
    )


llm = llm_connection()
structured_llm = (
    llm.with_structured_output(PolisherOutput, include_raw=True) if llm else None
)


def polisher_node(state: AgentState):
    """
    Polish writer draft style while preserving factual content.
    """
    writer_blob = state.get("writer") or {}
    researcher_blob = state.get("researcher") or {}
    checker_blob = state.get("fastChecker") or {}

    draft = (writer_blob.get("draft") or "").strip()
    facts = [f.strip() for f in (researcher_blob.get("facts") or []) if f and f.strip()]
    failed_facts = [
        f.strip() for f in (checker_blob.get("failed_facts") or []) if f and f.strip()
    ]
    prd = (state.get("prd") or "").strip()

    if not draft:
        return {
            "polisherAgent": {"final_post": ""},
            "error": "Polisher skipped: writer draft is empty.",
            "current_agent": state.get("current_agent"),
        }

    if not structured_llm:
        fallback = postprocess_polished_output(draft)
        return {
            "polisherAgent": {"final_post": fallback},
            "error": "Polisher used fallback: LLM is not configured.",
            "current_agent": state.get("current_agent"),
        }

    facts_block = "\n".join(f"- {fact}" for fact in facts) if facts else "- (No facts)"
    failed_facts_block = (
        "\n".join(f"- {fact}" for fact in failed_facts) if failed_facts else "- (None)"
    )

    raw_out = structured_llm.invoke(
        build_polisher_prompt(prd, facts_block, failed_facts_block, draft) #prompt
    )
    usage_delta = {"input": 0, "output": 0}
    if isinstance(raw_out, dict) and "parsed" in raw_out:
        result = raw_out["parsed"]
        usage_delta = extract_usage_metadata(raw_out.get("raw"))
    else:
        result = raw_out

    polished = postprocess_polished_output(result.final_post)
    is_valid, errors = validate_polished_output(polished)
    metrics = merge_usage(dict(state), usage_delta)

    if not is_valid:
        fallback = postprocess_polished_output(draft)
        return {
            "polisherAgent": {"final_post": fallback},
            "error": f"Polisher validation failed: {'; '.join(errors)}",
            "current_agent": state.get("current_agent"),
            **metrics,
        }

    return {
        "polisherAgent": {"final_post": polished},
        "error": None,
        "current_agent": state.get("current_agent"),
        **metrics,
    }
