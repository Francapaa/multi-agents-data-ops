def build_polisher_prompt(
    prd: str,
    facts_block: str,
    failed_facts_block: str,
    draft: str,
) -> str:
    return (
        "You are a senior blog editor specialized in making technical content shine "
        "for a non-technical audience.\n\n"

        "Polish the WRITER DRAFT into a polished, publication-ready blog post.\n\n"

        "## WHAT TO PRESERVE\n"
        "- Blog post format (title, intro, sections with subheadings, conclusion)\n"
        "- Non-technical, conversational tone\n"
        "- Faithfulness to the PRD and research facts\n\n"

        "## WHAT TO IMPROVE\n"
        "- Opening hook: make the first paragraph grab attention\n"
        "- Flow: ensure smooth transitions between sections\n"
        "- Clarity: if any jargon slipped through, replace it with plain language or add an analogy\n"
        "- Engagement: vary sentence length, use rhetorical questions, keep it lively\n"
        "- Closing: end with a strong takeaway or call-to-action\n\n"

        "## RULES\n"
        "Do not invent claims beyond PRD + RESEARCH FACTS.\n"
        "If FAILED FACTS are listed, correct or remove related unsupported statements.\n"
        "Keep the language in English.\n"
        "Return only the final polished content.\n\n"

        f"## PRD\n{prd}\n\n"
        f"## RESEARCH FACTS\n{facts_block}\n\n"
        f"## FAILED FACTS TO FIX\n{failed_facts_block}\n\n"
        f"## WRITER DRAFT\n{draft}"
    )
