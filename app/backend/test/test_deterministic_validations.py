from agents.validators.deterministic_validations import (
    postprocess_polished_output,
    validate_polished_output,
)


class TestPostprocessPolishedOutput:
    def test_empty_string_returns_empty(self):
        assert postprocess_polished_output("") == ""

    def test_whitespace_only_returns_empty(self):
        assert postprocess_polished_output("   \n  \n  ") == ""

    def test_removes_trailing_spaces(self):
        result = postprocess_polished_output("hello   \nworld  ")
        assert "hello\nworld" == result

    def test_collapses_excessive_blank_lines(self):
        result = postprocess_polished_output("a\n\n\n\nb")
        assert "a\n\nb" == result

    def test_preserves_two_blank_lines(self):
        result = postprocess_polished_output("a\n\nb")
        assert result == "a\n\nb"

    def test_heading_needs_space_after_hash(self):
        result = postprocess_polished_output("#Title")
        assert result.startswith("# ")

    def test_bullet_normalization(self):
        text = "* item\n\u2022 item"
        result = postprocess_polished_output(text)
        assert result == "- item\n- item"

    def test_fenced_code_block_preserved(self):
        text = "before\n```python\nprint(  'hello'  )\n```\nafter"
        result = postprocess_polished_output(text)
        assert "print(  'hello'  )" in result

    def test_windows_line_endings_normalized(self):
        result = postprocess_polished_output("line1\r\nline2\r\nline3")
        assert result == "line1\nline2\nline3"

    def test_mac_line_endings_normalized(self):
        result = postprocess_polished_output("line1\rline2\rline3")
        assert result == "line1\nline2\nline3"

    def test_full_markdown_pipeline(self):
        text = (
            "#Title\n\n"
            "Intro para.   \n\n"
            "##Section\n\n"
            "* bullet 1\n"
            "* bullet 2\n\n\n"
            "```code\n  preserved  \n```\n\n"
            "Conclusion."
        )
        result = postprocess_polished_output(text)
        assert result.startswith("# ")
        assert "  preserved  " in result
        assert "Intro para." in result
        assert "\n\n\n" not in result


class TestValidatePolishedOutput:
    def test_empty_text_fails(self):
        valid, errors = validate_polished_output("")
        assert not valid
        assert "Empty" in errors[0]

    def test_short_text_fails(self, short_text):
        valid, errors = validate_polished_output(short_text)
        assert not valid
        assert any("short" in e.lower() for e in errors)

    def test_no_newlines_fails(self):
        valid, errors = validate_polished_output("a" * 200)
        assert not valid
        assert any("structure" in e.lower() for e in errors)

    def test_valid_text_passes(self, sample_text):
        valid, errors = validate_polished_output(sample_text)
        assert valid
        assert errors == []

    def test_whitespace_only_fails(self):
        valid, errors = validate_polished_output("   ")
        assert not valid

    def test_multiple_errors_reported(self):
        valid, errors = validate_polished_output("short")
        assert not valid
        assert len(errors) >= 2
