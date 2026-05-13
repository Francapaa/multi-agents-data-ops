from pydantic import BaseModel, Field
from langchain_community.tools.tavily_search import TavilySearchResults

from ..llm_connection import extract_usage_metadata, llm_connection, merge_usage
from ..state import AgentState

tavily_tool = TavilySearchResults(max_results=3)
llm = llm_connection()


class SearchQueries(BaseModel):
    queries: list[str] = Field(description="List of 3 optimized queries to Google")


structured_llm = (
    llm.with_structured_output(SearchQueries, include_raw=True) if llm else None
)


def researcher_node(state: AgentState):
    prd_content = state["prd"]
    usage_delta = {"input": 0, "output": 0}

    if not structured_llm:
        return {
            "researcher": {
                "search_queries": [],
                "sources": [],
                "facts": [],
                "context": "Research skipped: LLM not configured.",
            },
            "current_agent": state.get("current_agent"),
            **merge_usage(dict(state), usage_delta),
        }

    raw_out = structured_llm.invoke(
        f"Analyze this PRD and generate 3 precise searches to collect technical data:{prd_content} "
    )
    if isinstance(raw_out, dict) and "parsed" in raw_out:
        search_input = raw_out["parsed"]
        raw_msg = raw_out.get("raw")
        usage_delta = extract_usage_metadata(raw_msg)
    else:
        search_input = raw_out
        usage_delta = {"input": 0, "output": 0}

    all_facts = []
    all_sources = []

    for q in search_input.queries:
        result = tavily_tool.invoke(q)
        all_facts.extend([r["content"] for r in result])
        all_sources.extend([r["url"] for r in result])

    metrics = merge_usage(dict(state), usage_delta)
    return {
        "researcher": {
            "search_queries": search_input.queries,
            "sources": list(set(all_sources)),
            "facts": list(set(all_facts)),
            "context": "Technique investigation finished successfully",
        },
        "current_agent": state.get("current_agent"),
        **metrics,
    }
