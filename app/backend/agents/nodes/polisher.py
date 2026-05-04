from ..state import AgentState
from ..state import PolisherAgent


def polisher_node(state: AgentState):
    """
    Minimal polisher: currently passes through writer draft as final_post.
    """
    draft = ((state.get("writer") or {}).get("draft") or "").strip()
    return {
        "polisherAgent": {"final_post": draft},
        "current_agent": state.get("current_agent"),
    }
