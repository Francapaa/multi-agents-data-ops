from pydantic import BaseModel, Field

from ..llm_connection import extract_usage_metadata, llm_connection, merge_usage
from ..prompts import build_checker_prompt
from ..state import AgentState
from ..validators.workflow_validations import CHECKER_CONFIDENCE_THRESHOLD


class CheckerOutput(BaseModel):
    verified: bool = Field(description="True when draft is consistent with facts.")
    failed_facts: list[str] = Field(
        description="Facts that are missing, contradicted, or distorted in the draft."
    )
    confidence: float = Field(
        description="Confidence score from 0.0 to 1.0 for the verification judgment."
    )


llm = llm_connection()
structured_llm = (
    llm.with_structured_output(CheckerOutput, include_raw=True) if llm else None
)


def checker_node(state: AgentState):
    """
    Invoke LLM with writer draft + researcher facts to detect mismatches.
    """
    researcher_blob = state.get("researcher") or {}
    writer_blob = state.get("writer") or {}
    facts = [f.strip() for f in (researcher_blob.get("facts") or []) if f and f.strip()]
    draft: str = (writer_blob.get("draft") or "").strip()

    prev_fc = state.get("fastChecker") or {}
    prev_retries = int(prev_fc.get("checker_retry_count") or 0)

    print("DENTRO DEL NODO CHECKER")
    print("RESEARCHER: ", researcher_blob)
    print("WRITER AGENT: ", writer_blob)
    print("DATOS REALES QUE TRAE EL RESEARCHER: ", facts)
    print("DRAFT GENERADO POR WRITER AGENT: ", draft)

    base_fast = {
        "verified": False,
        "failed_facts": [],
        "confidence": 0.0,
        "requested_writer_retry": False,
        "checker_retry_count": 0,
    }

    if not facts:
        return {
            "fastChecker": base_fast,
            "error": "Checker skipped: no research facts available.",
            "current_agent": state.get("current_agent"),
        }

    if not draft:
        return {
            "fastChecker": base_fast,
            "error": "Checker skipped: no draft generated in writer agent.",
            "current_agent": state.get("current_agent"),
        }

    if not structured_llm:
        return {
            "fastChecker": base_fast,
            "error": "Checker skipped: LLM is not configured.",
            "current_agent": state.get("current_agent"),
        }

    facts_block = "\n".join(f"- {fact}" for fact in facts)

    raw_out = structured_llm.invoke(build_checker_prompt(facts_block, draft)) #prompt
    usage_delta = {"input": 0, "output": 0}
    if isinstance(raw_out, dict) and "parsed" in raw_out:
        result = raw_out["parsed"]
        usage_delta = extract_usage_metadata(raw_out.get("raw"))
    else:
        result = raw_out

    confidence = float(result.confidence)
    requested = confidence < CHECKER_CONFIDENCE_THRESHOLD
    print("CONFIANZA GENERADA POR EL CHECKER: ", confidence)
    
    print(result)
    metrics = merge_usage(dict(state), usage_delta)
    return {
        "fastChecker": {
            "verified": result.verified,
            "failed_facts": result.failed_facts,
            "confidence": confidence,
            "requested_writer_retry": requested,
            "checker_retry_count": prev_retries + 1,
        },
        "error": None,
        "current_agent": state.get("current_agent"),
        **metrics,
    }
