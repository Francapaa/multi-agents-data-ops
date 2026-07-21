import os
from unittest.mock import MagicMock, patch

from agents.state import AgentState


def _make_state(prd: str = "Build a todo app with React."):
    from uuid import uuid4

    return {
        "prd": prd,
        "project_id": uuid4(),
        "run_id": uuid4(),
        "target_audience": "b2c",
        "researcher": {
            "search_queries": [],
            "sources": [],
            "facts": [],
            "context": "",
        },
        "writer": {"draft": "", "retry_count": 0},
        "fastChecker": {
            "verified": None,
            "failed_facts": [],
            "confidence": 0.0,
            "requested_writer_retry": False,
            "checker_retry_count": 0,
        },
        "polisherAgent": {"final_post": ""},
        "error": None,
        "current_agent": uuid4(),
        "total_input_tokens": 0,
        "total_output_tokens": 0,
    }


class TestResearcherNode:
    def test_researcher_generates_queries_and_facts(self, monkeypatch):
        os.environ["TAVILY_API_KEY"] = "fake-key"
        import agents.nodes.researcher as researcher_module
        from agents.nodes.researcher import SearchQueries

        mock_structured = MagicMock()
        mock_structured.invoke.return_value = {
            "parsed": SearchQueries(queries=[
                "React todo app tutorial",
                "best React practices 2024",
                "todo app UI design",
            ]),
            "raw": MagicMock(usage_metadata={"input_tokens": 10, "output_tokens": 20}),
        }
        monkeypatch.setattr(researcher_module, "structured_llm", mock_structured)

        mock_tavily = MagicMock()
        mock_tavily.invoke.return_value = {
            "results": [
                {"content": "React is great for todo apps.", "url": "https://example.com/1"},
                {"content": "Use hooks for state management.", "url": "https://example.com/2"},
            ],
        }
        monkeypatch.setattr(researcher_module, "tavily_tool", mock_tavily)

        state = _make_state()
        result = researcher_module.researcher_node(state)

        researcher = result["researcher"]
        assert len(researcher["search_queries"]) == 3
        assert len(researcher["sources"]) == 2
        assert len(researcher["facts"]) == 2
        assert any("React" in f for f in researcher["facts"])

    def test_researcher_no_llm_skips(self, monkeypatch):
        os.environ["TAVILY_API_KEY"] = "fake-key"
        import agents.nodes.researcher as researcher_module

        monkeypatch.setattr(researcher_module, "structured_llm", None)

        state = _make_state()
        result = researcher_module.researcher_node(state)

        assert result["researcher"]["context"] == "Research skipped: LLM not configured."
        assert result["researcher"]["facts"] == []

    def test_researcher_empty_results_handled(self, monkeypatch):
        os.environ["TAVILY_API_KEY"] = "fake-key"
        import agents.nodes.researcher as researcher_module
        from agents.nodes.researcher import SearchQueries

        mock_structured = MagicMock()
        mock_structured.invoke.return_value = {
            "parsed": SearchQueries(queries=["query 1", "query 2", "query 3"]),
            "raw": MagicMock(usage_metadata={"input_tokens": 5, "output_tokens": 10}),
        }
        monkeypatch.setattr(researcher_module, "structured_llm", mock_structured)

        mock_tavily = MagicMock()
        mock_tavily.invoke.return_value = {"results": []}
        monkeypatch.setattr(researcher_module, "tavily_tool", mock_tavily)

        state = _make_state()
        result = researcher_module.researcher_node(state)

        assert result["researcher"]["facts"] == []
        assert "no results list" in result["researcher"]["context"]

    def test_researcher_tracks_metrics(self, monkeypatch):
        os.environ["TAVILY_API_KEY"] = "fake-key"
        import agents.nodes.researcher as researcher_module
        from agents.nodes.researcher import SearchQueries

        mock_structured = MagicMock()
        mock_structured.invoke.return_value = {
            "parsed": SearchQueries(queries=["q1", "q2", "q3"]),
            "raw": MagicMock(usage_metadata={"input_tokens": 10, "output_tokens": 20}),
        }
        monkeypatch.setattr(researcher_module, "structured_llm", mock_structured)

        mock_tavily = MagicMock()
        mock_tavily.invoke.return_value = {
            "results": [{"content": "Fact 1", "url": "https://example.com"}],
        }
        monkeypatch.setattr(researcher_module, "tavily_tool", mock_tavily)

        state = _make_state()
        state["total_input_tokens"] = 100
        state["total_output_tokens"] = 50
        result = researcher_module.researcher_node(state)

        assert result["total_input_tokens"] >= 100
        assert result["total_output_tokens"] >= 50
