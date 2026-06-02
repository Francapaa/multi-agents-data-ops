# WE DEFINE TYPEDICT WITH THE GRAPH STATE
import uuid
from typing import Optional

from typing_extensions import NotRequired, TypedDict


# WE DEFINE THE STATE OF EVERY AGENT, BUT THEN THEY SHARE THE LOGIC IN AGENTSTATE
class ResearcherAgent(TypedDict):
    search_queries: list[str]
    sources: list[str]
    facts: list[str]
    context: str


class WriterAgent(TypedDict):
    draft: str
    retry_count: int  # IF retry_count >= 3 THE PROCESS WILL BE FINISHED


class FastCheckerAgent(TypedDict):
    verified: Optional[bool]
    failed_facts: list[str]
    confidence: float
    requested_writer_retry: bool
    checker_retry_count: int # to not being in a constant loop


class PolisherAgent(TypedDict):
    final_post: str


class AgentState(TypedDict):
    # INPUT
    prd: str
    project_id: uuid.UUID
    run_id: uuid.UUID

    # AGENTS
    researcher: ResearcherAgent
    writer: WriterAgent
    fastChecker: FastCheckerAgent
    polisherAgent: PolisherAgent

    # CONTROL
    error: Optional[str]
    current_agent: uuid.UUID

    # METRICS (acumulado en nodos)
    total_input_tokens: NotRequired[int]
    total_output_tokens: NotRequired[int]
