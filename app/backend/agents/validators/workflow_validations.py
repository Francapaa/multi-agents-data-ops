from langgraph.graph import END

from ..state import AgentState

WRITER_DRAFT_MIN_CHARS = 100
WRITER_RETRY_LIMIT = 3
CHECKER_CONFIDENCE_THRESHOLD = 0.6


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

    if not is_writer_draft_too_short(draft):
        return "fast_checker"
    if attempts >= WRITER_RETRY_LIMIT:
        return END # if attemps > 3 we'll finish the process
    return "writer"


def route_after_checker(state: AgentState):
    """added confidence, if it is less than 0.6, we will return to writer agent"""
    fast_checker_blob = state.get("fastChecker") or {}
    confidence = float(fast_checker_blob.get("confidence") or 0.0)
    if confidence < CHECKER_CONFIDENCE_THRESHOLD:
        return "writer"
    return "polisher"