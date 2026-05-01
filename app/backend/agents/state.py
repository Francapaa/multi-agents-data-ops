#WE DEFINE TYPEDICT WITH THE GRAPH STATE
from io import Writer
from typing import Optional
import uuid
from typing_extensions import TypedDict, Annotated


#WE DEFINE THE STATE OF EVERY AGENT, BUT THEN THEY SHARE THE LOGIC IN AGENTSTATE
class ResearcherAgent(TypedDict):
    search_querie: list[str]
    sources: list[str]
    facts: list[str]
    context: str

class WriterAgent(TypedDict):
    draft: str

class FastCheckerAgent(TypedDict):
    verified: Optional[bool]
    failed_facts: list[str]
    retry_count: int #IF retry_count >= 3 THE PROCESS WILL BE FINISHED

class PolisherAgent(TypedDict):
    final_post: str

    

class AgentState(TypedDict):
    #INPUT
    prd: str
    project_id: uuid.UUID
    run_id: uuid.UUID

    #AGENTS
    researcher: ResearcherAgent
    writer: WriterAgent
    fastChecker: FastCheckerAgent
    polisherAgent: PolisherAgent


    #CONTROL
    error: Optional[str]
    current_agent: uuid.UUID #AGENT ID to identify in DATABASE

    