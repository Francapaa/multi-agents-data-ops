# HERE, SHARED LLM FACTORY FOR LANGCHAIN / GEMINI

import os
from typing import Any

from langchain_google_genai import ChatGoogleGenerativeAI


def llm_connection() -> ChatGoogleGenerativeAI | None:
    api_key = os.getenv("GOOGLE_API_KEY")

    if not api_key:
        print("API KEY NOT PROVIDED")
        return None

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0.1,  # Low to better precision 
    )
    return llm


def extract_usage_metadata(response: Any) -> dict[str, int]:
    md = getattr(response, "usage_metadata", None) or {}
    inp = md.get("input_tokens")
    if inp is None:
        inp = md.get("prompt_token_count") or md.get("prompt_tokens") or 0
    out = md.get("output_tokens")
    if out is None:
        out = md.get("candidates_token_count") or md.get("completion_tokens") or 0
    return {"input": int(inp or 0), "output": int(out or 0)}


def merge_usage(state: dict[str, Any], usage: dict[str, int]) -> dict[str, int]:
    prev_in = int(state.get("total_input_tokens") or 0)
    prev_out = int(state.get("total_output_tokens") or 0)
    return {
        "total_input_tokens": prev_in + int(usage.get("input") or 0),
        "total_output_tokens": prev_out + int(usage.get("output") or 0),
    }
