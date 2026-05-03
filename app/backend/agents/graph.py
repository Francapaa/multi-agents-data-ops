# HERE WE DEFINE THE WORKFLOW OF THE AGENTS AND EDGE CASES

from langgraph.graph import END, START, StateGraph

from .nodes.checker import checker_node
from .nodes.researcher import researcher_node
from .nodes.writer import writer_node
from .state import AgentState

WRITER_DRAFT_MIN_CHARS = 100
WRITER_RETRY_LIMIT = 3  # aligns with WriterAgent.retry_count cap in routing


def is_writer_draft_too_short(
    draft: str, min_chars: int = WRITER_DRAFT_MIN_CHARS
) -> bool:
    return len(draft.strip()) < min_chars


def quantity_of_retry(writer_blob: dict) -> int:
    """Attempts so far recorded on the writer sub-state (incremented each writer run)."""
    return int(writer_blob.get("retry_count") or 0)


def route_after_writer(state: AgentState):
    writer_blob = state.get("writer") or {}  # we get the writer state
    draft = writer_blob.get("draft") or ""
    attempts = quantity_of_retry(writer_blob)

    if not is_writer_draft_too_short(draft):
        return "fast_checker"
    if attempts >= WRITER_RETRY_LIMIT:
        return END
    return "writer"


workflow = StateGraph(AgentState)

workflow.add_node("researcher", researcher_node)
workflow.add_node("writer", writer_node)
workflow.add_node("fast_checker", checker_node)

workflow.add_edge(START, "researcher")
workflow.add_edge("researcher", "writer")
workflow.add_conditional_edges(
    "writer",
    route_after_writer,
    {
        "writer": "writer",
        "fast_checker": "fast_checker",
        END: END,
    }, #depending on the return statement 
)
workflow.add_edge("fast_checker", END)


def get_compiled_workflow():
    return workflow.compile()
