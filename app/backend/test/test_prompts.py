from agents.prompts.writer import build_writer_prompt
from agents.prompts.polisher import build_polisher_prompt
from agents.prompts.checker import build_checker_prompt
from agents.prompts.researcher import build_researcher_prompt


class TestBuildWriterPrompt:
    def test_b2b_audience_contains_business_language(self):
        prompt = build_writer_prompt("b2b")
        assert "ROI" in prompt
        assert "decision-makers" in prompt
        assert "operational efficiency" in prompt

    def test_b2c_audience_contains_consumer_language(self):
        prompt = build_writer_prompt("b2c")
        assert "consumers" in prompt
        assert "ease of use" in prompt
        assert "emotional" in prompt

    def test_custom_audience_uses_value_directly(self):
        prompt = build_writer_prompt("inversores")
        assert "## AUDIENCE" in prompt
        assert "inversores" in prompt

    def test_empty_string_uses_fallback(self):
        prompt = build_writer_prompt("")
        assert "A general non-technical audience" in prompt

    def test_prompt_includes_format_section(self):
        prompt = build_writer_prompt("b2c")
        assert "## FORMAT" in prompt
        assert "## TONE & STYLE" in prompt
        assert "## GROUNDING" in prompt

    def test_prompt_includes_examples(self):
        prompt = build_writer_prompt("b2c")
        assert "QR-based offline payment" in prompt
        assert "AI-powered sales dashboard" in prompt


class TestBuildPolisherPrompt:
    def test_b2b_audience_included(self):
        prompt = build_polisher_prompt(
            prd="test prd",
            facts_block="fact 1",
            failed_facts_block="none",
            draft="test draft",
            target_audience="b2b",
        )
        assert "ROI" in prompt
        assert "decision-makers" in prompt

    def test_b2c_audience_included(self):
        prompt = build_polisher_prompt(
            prd="test prd",
            facts_block="fact 1",
            failed_facts_block="none",
            draft="test draft",
            target_audience="b2c",
        )
        assert "consumers" in prompt
        assert "ease of use" in prompt

    def test_default_audience_is_b2c(self):
        prompt = build_polisher_prompt(
            prd="test prd",
            facts_block="fact 1",
            failed_facts_block="none",
            draft="test draft",
        )
        assert "consumers" in prompt

    def test_custom_audience(self):
        prompt = build_polisher_prompt(
            prd="test prd",
            facts_block="fact 1",
            failed_facts_block="none",
            draft="test draft",
            target_audience="developers",
        )
        assert "developers" in prompt

    def test_includes_prd_content(self):
        prompt = build_polisher_prompt(
            prd="my product description",
            facts_block="fact 1",
            failed_facts_block="none",
            draft="test draft",
        )
        assert "my product description" in prompt

    def test_includes_writer_draft(self):
        prompt = build_polisher_prompt(
            prd="prd",
            facts_block="facts",
            failed_facts_block="none",
            draft="the actual draft content",
        )
        assert "the actual draft content" in prompt

    def test_includes_failed_facts(self):
        prompt = build_polisher_prompt(
            prd="prd",
            facts_block="facts",
            failed_facts_block="failed fact 1\nfailed fact 2",
            draft="draft",
        )
        assert "failed fact 1" in prompt
        assert "failed fact 2" in prompt

    def test_audience_section_present(self):
        prompt = build_polisher_prompt(
            prd="prd",
            facts_block="facts",
            failed_facts_block="none",
            draft="draft",
        )
        assert "This post is aimed at:" in prompt


class TestBuildCheckerPrompt:
    def test_prompt_includes_facts(self):
        prompt = build_checker_prompt("fact 1\nfact 2", "draft content")
        assert "fact 1" in prompt
        assert "fact 2" in prompt

    def test_prompt_includes_draft(self):
        prompt = build_checker_prompt("facts", "the writer draft")
        assert "the writer draft" in prompt

    def test_prompt_includes_strict_checker_instruction(self):
        prompt = build_checker_prompt("facts", "draft")
        assert "strict factual checker" in prompt

    def test_confidence_range_instruction(self):
        prompt = build_checker_prompt("facts", "draft")
        assert "0.9" in prompt


class TestBuildResearcherPrompt:
    def test_prompt_includes_prd_content(self):
        prompt = build_researcher_prompt("my PRD content here")
        assert "my PRD content here" in prompt

    def test_prompt_mentions_search_queries(self):
        prompt = build_researcher_prompt("PRD")
        assert "3 precise searches" in prompt or "searches" in prompt
