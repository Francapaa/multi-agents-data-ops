#HERE, SHARED LLM FACTORY FOR LANGCHAIN / GEMINI

import os

from langchain_google_genai import ChatGoogleGenerativeAI


def llm_connection():
    api_key = os.getenv("GOOGLE_API_KEY")

    if not api_key:
        print("API KEY NOT PROVIDED")
        return

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.1,  # Low to better precision
    )
    return llm
