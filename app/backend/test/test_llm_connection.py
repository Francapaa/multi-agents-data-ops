from agents.llm_connection import extract_usage_metadata, merge_usage


class FakeResponse:
    def __init__(self, usage_metadata: dict | None):
        self.usage_metadata = usage_metadata


class TestExtractUsageMetadata:
    def test_standard_input_output_tokens(self):
        resp = FakeResponse({"input_tokens": 100, "output_tokens": 50})
        result = extract_usage_metadata(resp)
        assert result == {"input": 100, "output": 50}

    def test_gemini_style_prompt_token_count(self):
        resp = FakeResponse({"prompt_token_count": 200, "candidates_token_count": 80})
        result = extract_usage_metadata(resp)
        assert result == {"input": 200, "output": 80}

    def test_openai_style_prompt_tokens(self):
        resp = FakeResponse({"prompt_tokens": 150, "completion_tokens": 60})
        result = extract_usage_metadata(resp)
        assert result == {"input": 150, "output": 60}

    def test_missing_usage_metadata(self):
        resp = FakeResponse(None)
        result = extract_usage_metadata(resp)
        assert result == {"input": 0, "output": 0}

    def test_partial_metadata_defaults_missing_to_zero(self):
        resp = FakeResponse({"input_tokens": 100})
        result = extract_usage_metadata(resp)
        assert result["input"] == 100
        assert result["output"] == 0

    def test_object_without_usage_metadata_attribute(self):
        result = extract_usage_metadata(object())
        assert result == {"input": 0, "output": 0}

    def test_empty_dict(self):
        result = extract_usage_metadata(FakeResponse(None))
        assert result == {"input": 0, "output": 0}

    def test_response_with_string_tokens(self):
        resp = FakeResponse({"input_tokens": "50", "output_tokens": "30"})
        result = extract_usage_metadata(resp)
        assert result == {"input": 50, "output": 30}


class TestMergeUsage:
    def test_merge_from_zero(self):
        state = {"total_input_tokens": 0, "total_output_tokens": 0}
        usage = {"input": 100, "output": 50}
        result = merge_usage(state, usage)
        assert result == {"total_input_tokens": 100, "total_output_tokens": 50}

    def test_merge_existing_tokens(self):
        state = {"total_input_tokens": 500, "total_output_tokens": 200}
        usage = {"input": 100, "output": 50}
        result = merge_usage(state, usage)
        assert result == {"total_input_tokens": 600, "total_output_tokens": 250}

    def test_state_without_tokens(self):
        state = {}
        usage = {"input": 10, "output": 5}
        result = merge_usage(state, usage)
        assert result == {"total_input_tokens": 10, "total_output_tokens": 5}

    def test_usage_with_missing_keys(self):
        state = {"total_input_tokens": 100, "total_output_tokens": 50}
        usage = {}
        result = merge_usage(state, usage)
        assert result == {"total_input_tokens": 100, "total_output_tokens": 50}

    def test_usage_with_none_values(self):
        state = {"total_input_tokens": 100, "total_output_tokens": 50}
        usage = {"input": None, "output": None}
        result = merge_usage(state, usage)
        assert result == {"total_input_tokens": 100, "total_output_tokens": 50}

    def test_negative_values(self):
        state = {"total_input_tokens": 0, "total_output_tokens": 0}
        usage = {"input": -10, "output": -5}
        result = merge_usage(state, usage)
        assert result == {"total_input_tokens": -10, "total_output_tokens": -5}
