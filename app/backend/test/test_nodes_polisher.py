from unittest.mock import MagicMock

from agents.nodes.polisher import PolisherOutput
from agents.validators.deterministic_validations import postprocess_polished_output


class MockMessage:
    def __init__(self):
        self.usage_metadata = {"input_tokens": 8, "output_tokens": 25}


def _make_state(draft: str = "A valid draft with enough content to pass validation."):
    from uuid import uuid4

    return {
        "prd": "A project.",
        "project_id": uuid4(),
        "run_id": uuid4(),
        "target_audience": "b2c",
        "researcher": {
            "search_queries": [],
            "sources": [],
            "facts": ["Fact 1: something."],
            "context": "",
        },
        "writer": {"draft": draft, "retry_count": 0},
        "fastChecker": {
            "verified": True,
            "failed_facts": [],
            "confidence": 0.95,
            "requested_writer_retry": False,
            "checker_retry_count": 1,
        },
        "polisherAgent": {"final_post": ""},
        "error": None,
        "current_agent": uuid4(),
        "total_input_tokens": 50,
        "total_output_tokens": 20,
    }


class TestPolisherNode:
    def test_polisher_returns_final_post(self, monkeypatch):
        import agents.nodes.polisher as polisher_module

        mock_structured = MagicMock()
        mock_structured.invoke.return_value = {
            "parsed": PolisherOutput(final_post="# Polished Post\n\nGreat content here. " * 20),
            "raw": MockMessage(),
        }
        monkeypatch.setattr(polisher_module, "structured_llm", mock_structured)

        state = _make_state()
        result = polisher_module.polisher_node(state)

        polished = result["polisherAgent"]["final_post"]
        assert "Polished" in polished
        assert result["error"] is None

    def test_polisher_empty_draft_returns_early(self, monkeypatch):
        import agents.nodes.polisher as polisher_module

        state = _make_state(draft="")
        result = polisher_module.polisher_node(state)

        assert result["polisherAgent"]["final_post"] == ""
        assert "empty" in (result.get("error") or "").lower()

    def test_polisher_validation_failure_uses_fallback(self, monkeypatch):
        import agents.nodes.polisher as polisher_module

        mock_structured = MagicMock()
        mock_structured.invoke.return_value = {
            "parsed": PolisherOutput(final_post="short"),
            "raw": MockMessage(),
        }
        monkeypatch.setattr(polisher_module, "structured_llm", mock_structured)

        state = _make_state(draft="Fallback draft that should pass validation easily.")
        result = polisher_module.polisher_node(state)

        assert "polisherAgent" in result

    def test_polisher_no_llm_uses_fallback(self, monkeypatch):
        import agents.nodes.polisher as polisher_module

        monkeypatch.setattr(polisher_module, "structured_llm", None)

        state = _make_state(draft="Fallback draft to use when LLM is not available.")
        result = polisher_module.polisher_node(state)

        assert result["polisherAgent"]["final_post"] != ""
        assert "LLM is not configured" in (result.get("error") or "")

    def test_polisher_passes_audience(self, monkeypatch):
        import agents.nodes.polisher as polisher_module

        mock_structured = MagicMock()
        mock_structured.invoke.return_value = {
            "parsed": PolisherOutput(final_post="# B2B Post\nContent for businesses."),
            "raw": MockMessage(),
        }
        monkeypatch.setattr(polisher_module, "structured_llm", mock_structured)

        state = _make_state()
        state["target_audience"] = "b2b"
        result = polisher_module.polisher_node(state)

        assert result["polisherAgent"]["final_post"]

    def test_polisher_tracks_metrics(self, monkeypatch):
        import agents.nodes.polisher as polisher_module

        mock_structured = MagicMock()
        mock_structured.invoke.return_value = {
            "parsed": PolisherOutput(final_post="# Post\nContent."),
            "raw": MockMessage(),
        }
        monkeypatch.setattr(polisher_module, "structured_llm", mock_structured)

        state = _make_state()
        result = polisher_module.polisher_node(state)

        assert result["total_input_tokens"] > 50
        assert result["total_output_tokens"] > 20
