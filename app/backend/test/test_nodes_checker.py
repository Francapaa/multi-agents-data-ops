from unittest.mock import MagicMock

from agents.nodes.checker import CheckerOutput
from agents.state import AgentState


class MockMessage:
    def __init__(self):
        self.usage_metadata = {"input_tokens": 5, "output_tokens": 10}


def _make_state(draft: str = "Valid blog post content.", facts: list[str] | None = None) -> AgentState:
    from uuid import uuid4

    resolved_facts = ["Fact 1: something true."] if facts is None else facts
    return {
        "prd": "A project.",
        "project_id": uuid4(),
        "run_id": uuid4(),
        "target_audience": "b2c",
        "researcher": {
            "search_queries": [],
            "sources": [],
            "facts": resolved_facts,
            "context": "",
        },
        "writer": {"draft": draft, "retry_count": 0},
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


class TestCheckerNode:
    def test_verified_draft_goes_through(self, monkeypatch):
        import agents.nodes.checker as checker_module

        mock_structured = MagicMock()
        mock_structured.invoke.return_value = {
            "parsed": CheckerOutput(verified=True, failed_facts=[], confidence=0.95),
            "raw": MockMessage(),
        }
        monkeypatch.setattr(checker_module, "structured_llm", mock_structured)

        state = _make_state()
        result = checker_module.checker_node(state)

        fc = result["fastChecker"]
        assert fc["verified"] is True
        assert fc["failed_facts"] == []
        assert fc["confidence"] >= 0.9
        assert fc["requested_writer_retry"] is False
        assert fc["checker_retry_count"] == 1
        assert result["error"] is None

    def test_low_confidence_requests_retry(self, monkeypatch):
        import agents.nodes.checker as checker_module

        mock_structured = MagicMock()
        mock_structured.invoke.return_value = {
            "parsed": CheckerOutput(verified=False, failed_facts=["Fact 1 seems off"], confidence=0.3),
            "raw": MockMessage(),
        }
        monkeypatch.setattr(checker_module, "structured_llm", mock_structured)

        state = _make_state()
        result = checker_module.checker_node(state)

        fc = result["fastChecker"]
        assert fc["verified"] is False
        assert fc["requested_writer_retry"] is True
        assert fc["confidence"] < 0.6

    def test_no_facts_skips_checker(self, monkeypatch):
        import agents.nodes.checker as checker_module

        state = _make_state(facts=[])
        result = checker_module.checker_node(state)

        assert "error" in result
        assert "no research facts" in result["error"].lower()
        assert result["fastChecker"]["verified"] is False

    def test_no_draft_skips_checker(self, monkeypatch):
        import agents.nodes.checker as checker_module

        state = _make_state(draft="")
        result = checker_module.checker_node(state)

        assert "error" in result
        assert "no draft" in result["error"].lower()

    def test_no_llm_skips_checker(self, monkeypatch):
        import agents.nodes.checker as checker_module

        monkeypatch.setattr(checker_module, "structured_llm", None)

        state = _make_state()
        result = checker_module.checker_node(state)

        assert "error" in result
        assert "LLM is not configured" in result["error"]

    def test_checker_increments_retry_count(self, monkeypatch):
        import agents.nodes.checker as checker_module

        mock_structured = MagicMock()
        mock_structured.invoke.return_value = {
            "parsed": CheckerOutput(verified=True, failed_facts=[], confidence=0.9),
            "raw": MockMessage(),
        }
        monkeypatch.setattr(checker_module, "structured_llm", mock_structured)

        state = _make_state()
        state["fastChecker"]["checker_retry_count"] = 2
        result = checker_module.checker_node(state)

        assert result["fastChecker"]["checker_retry_count"] == 3
