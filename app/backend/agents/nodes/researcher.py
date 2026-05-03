
from ..state import AgentState
from ..state import ResearcherAgent
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools.tavily_search import TavilySearchResults
from ..llm_connection import llm_connection

class SearchQueries(BaseModel):
    queries: list[str] = Field(description="List of 3 optimized queries to Google")

tavily_tool = TavilySearchResults(max_results=3)
llm = llm_connection()
structured_llm = llm.with_structured_output(SearchQueries)

def researcher_node(state: AgentState):
    prd_content = state["prd"]

    search_input = structured_llm.invoke(
        f"Analyze this PRD and generate 3 precise searches to collect technical data:{prd_content} "
    )

    all_facts = []
    all_sources = []

    for q in search_input.queries:
        result = tavily_tool.invoke(q) # q queries 
        all_facts.extend([r["content"] for r in result])
        all_sources.extend([r["url"] for r in result])
    return {
        "researcher":{
            "search_queries": search_input.queries,
            "sources": list[str](set(all_sources)),
            "facts": list[str](set(all_facts)),
            "context": "Technique investigation finished successfully"
        },
        "current_agent": state.get("current_agent")
   }     