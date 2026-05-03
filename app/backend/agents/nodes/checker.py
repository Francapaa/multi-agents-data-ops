from ..state import AgentState


def checker_node(state: AgentState):

    """
    APPROACH: INVOKE THE LLM WITH THE DRAFT AND FACTS, THEN THE LLM MUST
              FIND DIFFERENCES BETWEEN DRAFT AND FACTS
    """

    return {
        "fastChecker": {
            "verified": None,
            "failed_facts": [],
        },
        "current_agent": state.get("current_agent"),
    }
