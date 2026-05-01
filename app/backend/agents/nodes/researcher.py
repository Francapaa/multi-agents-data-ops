from ..state import AgentState
from ..state import ResearcherAgent
from pydantic import BaseModel, Field


class SearchQueries(BaseModel):
    queries: list[str] = Field(description="List of 3 optimized queries to Google")


#llm_model = ChatGeminiAPI(model="gemini-2.5-flash")