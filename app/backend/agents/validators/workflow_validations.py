from langgraph.graph import END

from ..state import AgentState

WRITER_DRAFT_MIN_CHARS = 100
WRITER_RETRY_LIMIT = 3
CHECKER_CONFIDENCE_THRESHOLD = 0.6
CHECKER_RETRY_LIMIT = 2


def is_writer_draft_too_short(
    draft: str, min_chars: int = WRITER_DRAFT_MIN_CHARS
) -> bool:
    """if the draft is less than 100 chars we reject the draft"""
    return len(draft.strip()) < min_chars


def quantity_of_retry(writer_blob: dict) -> int:
    """Attempts recorded on writer sub-state."""
    return int(writer_blob.get("retry_count") or 0)


def route_after_writer(state: AgentState):
    """Validators for the writer agent"""
    writer_blob = state.get("writer") or {}
    draft = writer_blob.get("draft") or ""
    attempts = quantity_of_retry(writer_blob)

    if attempts >= WRITER_RETRY_LIMIT:
        return END # si primero estaba el otro if se queda en loop infinito y nunca
                   # tiraba error 
    if not is_writer_draft_too_short(draft):
        return "fast_checker"
    return "writer"


def route_after_checker(state: AgentState):
    """If draft is not verified and has failed facts, retry writer up to CHECKER_RETRY_LIMIT times."""
    fc = state.get("fastChecker") or {}
    verified = fc.get("verified")
    failed_facts = fc.get("failed_facts") or []
    retry_count = int(fc.get("checker_retry_count") or 0)

    if not verified and failed_facts and retry_count < CHECKER_RETRY_LIMIT:
        return "writer"
    return "polisher"