# HERE WE DEFINE THE WORKFLOW OF THE AGENTS AND EDGE CASES

from langgraph.graph import END, START, StateGraph

from .nodes.researcher import researcher_node
from .nodes.writer import writer_node
from .state import AgentState

WRITER_DRAFT_MIN_CHARS = 100
"""Minimum stripped length for writer draft before accepting END."""


def is_writer_draft_too_short(
    draft: str, min_chars: int = WRITER_DRAFT_MIN_CHARS
) -> bool:
    return len(draft.strip()) < min_chars


def route_after_writer(state: AgentState):
    draft = (state.get("writer") or {}).get("draft") or ""
    if not is_writer_draft_too_short(draft):
        return END
    # Same writer node runs again until the draft is long enough (no arbitrary stop).
    return "writer"


workflow = StateGraph(AgentState)

workflow.add_node("researcher", researcher_node)
workflow.add_node("writer", writer_node)

workflow.add_edge(START, "researcher")
workflow.add_edge("researcher", "writer")
workflow.add_conditional_edges(
    "writer",
    route_after_writer,
    {
        END: END,
        "writer": "writer",
    },
)


def get_compiled_workflow():
    return workflow.compile()
