import re


def _normalize_non_code_block(text: str) -> str:
    """Apply deterministic cleanup rules outside fenced code blocks."""
    out = text
    out = re.sub(r"[ \t]+$", "", out, flags=re.MULTILINE)  # trailing spaces
    out = re.sub(r"\n{3,}", "\n\n", out)  # max two consecutive blank lines
    out = re.sub(r"^(#{1,6})([^ #\n])", r"\1 \2", out, flags=re.MULTILINE)  # headings
    out = re.sub(r"^[\t ]*[\*\u2022][\t ]+", "- ", out, flags=re.MULTILINE)  # bullets
    return out


def postprocess_polished_output(text: str) -> str:
    """
    Deterministic post-processing for polished markdown text.
    Keeps fenced code blocks untouched to avoid formatting regressions.
    """
    if not text:
        return ""

    normalized = re.sub(r"\r\n?", "\n", text)
    # normalize from win or mac to unix style
    parts = re.split(r"(```[\s\S]*?```)", normalized)
    cleaned_parts: list[str] = []

    for index, part in enumerate(parts):
        # Odd indices correspond to fenced code blocks due to capturing split.
        if index % 2 == 1 and part.startswith("```"):
            cleaned_parts.append(part)
            continue
        cleaned_parts.append(_normalize_non_code_block(part))

    return "".join(cleaned_parts).strip()


def validate_polished_output(text: str) -> tuple[bool, list[str]]:
    """
    Minimal deterministic validator for polished output quality gates.
    """
    errors: list[str] = []
    candidate = (text or "").strip()

    if not candidate:
        errors.append("Empty final output.")
        return False, errors

    if len(candidate) < 120:
        errors.append("Output is too short (<120 chars).")

    if candidate.count("\n") < 2:
        errors.append("Output has poor structure (not enough line breaks).")

    return len(errors) == 0, errors