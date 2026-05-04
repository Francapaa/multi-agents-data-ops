# HERE WE DEFINE THE WORKFLOW OF THE AGENTS AND EDGE CASES

from langgraph.graph import END, START, StateGraph

from .nodes.checker import checker_node
from .nodes.polisher import polisher_node
from .nodes.researcher import researcher_node
from .nodes.writer import writer_node
from .state import AgentState
from .validators import route_after_checker, route_after_writer

    
workflow = StateGraph(AgentState)

workflow.add_node("researcher", researcher_node)
workflow.add_node("writer", writer_node)
workflow.add_node("fast_checker", checker_node)
workflow.add_node("polisher", polisher_node)

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
workflow.add_conditional_edges(
    "fast_checker",
    route_after_checker,
    {
        "writer": "writer",
        "polisher": "polisher",
    },
)
workflow.add_edge("polisher", END)


def get_compiled_workflow():
    return workflow.compile()
