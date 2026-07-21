from unittest.mock import MagicMock

from agents.state import AgentState


class MockMessage:
    def __init__(self, content: str):
        self.content = content
        self.usage_metadata = {"input_tokens": 15, "output_tokens": 40}


def _make_state(overrides: dict | None = None) -> AgentState:
    from uuid import uuid4

    base: AgentState = {
        "prd": "A new project to build a todo app.",
        "project_id": uuid4(),
        "run_id": uuid4(),
        "target_audience": "b2c",
        "researcher": {
            "search_queries": [],
            "sources": [],
            "facts": ["Fact 1: todo apps are popular.", "Fact 2: React is a good choice."],
            "context": "Research complete.",
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
        "total_input_tokens": 100,
        "total_output_tokens": 50,
    }
    if overrides:
        base.update(overrides)
    return base


class TestWriterNode:
    def test_writer_node_generates_draft(self, monkeypatch):
        import agents.nodes.writer as writer_module

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MockMessage(
            "# Generated Blog Post\n\nThis is the generated content."
        )
        monkeypatch.setattr(writer_module, "llm", mock_llm)

        state = _make_state()
        result = writer_module.writer_node(state)

        writer = result["writer"]
        assert "draft" in writer
        assert "Generated Blog Post" in writer["draft"]
        assert writer["retry_count"] == 1

    def test_writer_node_with_failed_facts(self, monkeypatch):
        import agents.nodes.writer as writer_module

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MockMessage(
            "# Corrected Blog Post\n\nCorrected content."
        )
        monkeypatch.setattr(writer_module, "llm", mock_llm)

        state = _make_state({
            "fastChecker": {
                "verified": False,
                "failed_facts": ["Fact 1 is wrong"],
                "confidence": 0.3,
                "requested_writer_retry": True,
                "checker_retry_count": 1,
            },
        })
        result = writer_module.writer_node(state)

        writer = result["writer"]
        assert "Corrected" in writer["draft"]
        assert writer["retry_count"] == 1

    def test_writer_node_accumulates_retry_count(self, monkeypatch):
        import agents.nodes.writer as writer_module

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MockMessage("# Draft")
        monkeypatch.setattr(writer_module, "llm", mock_llm)

        state = _make_state({"writer": {"draft": "old draft", "retry_count": 2}})
        result = writer_module.writer_node(state)

        assert result["writer"]["retry_count"] == 3

    def test_writer_node_includes_metrics(self, monkeypatch):
        import agents.nodes.writer as writer_module

        mock_llm = MagicMock()
        mock_llm.invoke.return_value = MockMessage("# Draft")
        monkeypatch.setattr(writer_module, "llm", mock_llm)

        state = _make_state()
        result = writer_module.writer_node(state)

        assert result["total_input_tokens"] > 0
        assert result["total_output_tokens"] > 0

    def test_writer_node_skipped_when_llm_none(self, monkeypatch):
        import agents.nodes.writer as writer_module

        monkeypatch.setattr(writer_module, "llm", None)

        state = _make_state()
        result = writer_module.writer_node(state)

        assert "(Writer skipped: LLM not configured.)" in result["writer"]["draft"]
