def build_researcher_prompt(prd_content: str) -> str:
    return (
        "Analyze this PRD and generate 3 precise searches to collect technical data:"
        f"{prd_content}"
    )
