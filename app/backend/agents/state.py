#WE DEFINE TYPEDICT WITH THE GRAPH STATE
from typing import Optional
import uuid
from typing_extensions import TypedDict, Annotated



class AgentState(TypedDict):
    #INPUT
    prd: str
    project_id: uuid.UUID
    run_id: uuid.UUID

    #RESEARCHER AGENT
    search_querie: list[str]
    sources: list[str]
    facts: list[str]
    context: str

    #WRITER AGENT
    draft: str
    
    #FAST-CHECKER AGENT
    verified: Optional[bool]
    failed_facts: list[str]
    retry_count: int #IF retry_count >= 3 THE PROCESS WILL BE FINISHED

    #POLISHER AGENT
    final_post: str

    #CONTROL
    error: Optional[str]
    current_agent: uuid.UUID #AGENT ID to identify in DATABASE