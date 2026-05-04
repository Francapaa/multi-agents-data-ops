from pydantic import BaseModel, Field

from ..llm_connection import llm_connection
from ..state import AgentState


class CheckerOutput(BaseModel):
    verified: bool = Field(description="True when draft is consistent with facts.")
    failed_facts: list[str] = Field(
        description="Facts that are missing, contradicted, or distorted in the draft."
    )
    confidence: float = Field(
        description="Confidence score from 0.0 to 1.0 for the verification judgment."
    )

#we make sure that the llm will answer with this type

llm = llm_connection()
structured_llm = llm.with_structured_output(CheckerOutput) if llm else None


def checker_node(state: AgentState):
    """
    Invoke LLM with writer draft + researcher facts to detect mismatches.
    """
    researcher_blob = state.get("researcher") or {}
    writer_blob = state.get("writer") or {}
    facts = [f.strip() for f in (researcher_blob.get("facts") or []) if f and f.strip()]
    draft: str = (writer_blob.get("draft") or "").strip()

    if not facts:
        return {
            "fastChecker": {
            "verified": False, 
            "failed_facts": [],
            "confidence": 0.0,
            },
            "error": "Checker skipped: no research facts available.",
            "current_agent": state.get("current_agent"),
        }

    if not draft:
        return {
            "fastChecker": {
                "verified": False, 
                "failed_facts": [],
                "confidence": 0.0,
                },
            "error": "Checker skipped: no draft generated in writer agent.",
            "current_agent": state.get("current_agent"),
        }

    if not structured_llm:
        return {
            "fastChecker": {
                "verified": False, 
                "failed_facts": [],
                "confidence": 0.0,
                },
            "error": "Checker skipped: LLM is not configured.",
            "current_agent": state.get("current_agent"),
        }

    facts_block = "\n".join(f"- {fact}" for fact in facts)
    checker_prompt = (
        "You are a strict factual checker.\n"
        "Compare the WRITER DRAFT against the RESEARCH FACTS.\n"
        "Mark verified=True only if the draft does not contradict facts and covers them accurately.\n"
        "For failed_facts, include only facts that are contradicted, missing, or meaningfully distorted.\n"
        "Set confidence as a float in [0,1]. Use >=0.9 only when evidence is clearly strong and consistent.\n"
        "Be concise and evidence-based. DO NOT INVENT FACTS.\n\n"
        f"## RESEARCH FACTS\n{facts_block}\n\n"
        f"## WRITER DRAFT\n{draft}"
    )

    result = structured_llm.invoke(checker_prompt)

    print(result) 
    return {
        "fastChecker": {
            "verified": result.verified,
            "failed_facts": result.failed_facts,
            "confidence": float(result.confidence),
        },
        "error": None,
        "current_agent": state.get("current_agent"),
    }
