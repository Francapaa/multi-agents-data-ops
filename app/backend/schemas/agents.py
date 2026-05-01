from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class ResearcherAgentSchema(BaseModel):
    search_querie: list[str] = []
    sources: list[str] = []
    facts: list[str] = []
    context: str = ""


class WriterAgentSchema(BaseModel):
    draft: str = ""


class FastCheckerAgentSchema(BaseModel):
    verified: Optional[bool] = None
    failed_facts: list[str] = []
    retry_count: int = 0


class PolisherAgentSchema(BaseModel):
    final_post: str = ""


class AgentStateSchema(BaseModel):
    prd: str = ""
    project_id: Optional[UUID] = None
    run_id: Optional[UUID] = None
    researcher: ResearcherAgentSchema = ResearcherAgentSchema()
    writer: WriterAgentSchema = WriterAgentSchema()
    fastChecker: FastCheckerAgentSchema = FastCheckerAgentSchema()
    polisherAgent: PolisherAgentSchema = PolisherAgentSchema()
    error: Optional[str] = None
    current_agent: Optional[UUID] = None