def build_checker_prompt(facts_block: str, draft: str) -> str:
    return (
        "You are a strict factual checker.\n"
        "Compare the WRITER DRAFT against the RESEARCH FACTS.\n"
        "Mark verified=True only if the draft does not contradict facts and covers them accurately.\n"
        "For failed_facts, include only facts that are contradicted, missing, or meaningfully distorted.\n"
        "Set confidence as a float in [0,1]. Use >=0.9 only when evidence is clearly strong and consistent.\n"
        "Be concise and evidence-based. DO NOT INVENT FACTS.\n\n"
        f"## RESEARCH FACTS\n{facts_block}\n\n"
        f"## WRITER DRAFT\n{draft}"
    )
