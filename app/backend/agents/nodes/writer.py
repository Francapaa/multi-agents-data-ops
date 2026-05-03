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
    facts: list[str] = researcher_blob.get("facts") or []
    researcher_context = researcher_blob.get("context") or ""

    facts_block = (
        "\n".join(f"- {f}".strip() for f in facts)
        if facts
        else "(No facts; draft from PRD only.)"
    )

    messages = [
        SystemMessage(
            content=(
                "Expert technical writer. Output a complete, structured draft in Spanish, "
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

    reply = llm.invoke(messages)
    draft = getattr(reply, "content", str(reply)).strip() 
    #extract content, if it doesnt contain anything we extract the message
    print("AI DRAFT GENERATED:\n",draft)
    return {
        "writer": {"draft": draft},
        "current_agent": state.get("current_agent"),
    }
