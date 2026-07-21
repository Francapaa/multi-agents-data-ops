from agents.validators.workflow_validations import (
    is_writer_draft_too_short,
    quantity_of_retry,
    route_after_writer,
    route_after_checker,
    WRITER_DRAFT_MIN_CHARS,
    WRITER_RETRY_LIMIT,
    CHECKER_CONFIDENCE_THRESHOLD,
    CHECKER_RETRY_LIMIT,
)
from langgraph.graph import END


class TestIsWriterDraftTooShort:
    def test_empty_draft_is_too_short(self):
        assert is_writer_draft_too_short("") is True

    def test_whitespace_only_is_too_short(self):
        assert is_writer_draft_too_short("   \n  ") is True

    def test_short_draft_is_too_short(self):
        assert is_writer_draft_too_short("a" * 50) is True

    def test_long_enough_draft_passes(self):
        assert is_writer_draft_too_short("a" * WRITER_DRAFT_MIN_CHARS) is False

    def test_exactly_min_chars(self):
        assert is_writer_draft_too_short("a" * WRITER_DRAFT_MIN_CHARS) is False

    def test_custom_min_chars(self):
        assert is_writer_draft_too_short("hello", min_chars=3) is False
        assert is_writer_draft_too_short("hi", min_chars=3) is True


class TestQuantityOfRetry:
    def test_no_writer_blob_returns_zero(self):
        assert quantity_of_retry({}) == 0

    def test_retry_count_zero(self):
        assert quantity_of_retry({"retry_count": 0}) == 0

    def test_retry_count_positive(self):
        assert quantity_of_retry({"retry_count": 2}) == 2

    def test_retry_count_missing_key(self):
        assert quantity_of_retry({"draft": "hello"}) == 0


class TestRouteAfterWriter:
    def test_short_draft_returns_writer(self):
        state = {"writer": {"draft": "short", "retry_count": 0}}
        assert route_after_writer(state) == "writer"

    def test_valid_draft_returns_fast_checker(self):
        state = {"writer": {"draft": "a" * 200, "retry_count": 0}}
        assert route_after_writer(state) == "fast_checker"

    def test_retry_limit_reached_returns_end(self):
        state = {"writer": {"draft": "short", "retry_count": WRITER_RETRY_LIMIT}}
        assert route_after_writer(state) is END

    def test_retry_limit_reached_even_with_long_draft(self):
        state = {
            "writer": {
                "draft": "a" * 500,
                "retry_count": WRITER_RETRY_LIMIT,
            }
        }
        assert route_after_writer(state) is END

    def test_empty_writer_blob_uses_defaults(self):
        state = {}
        assert route_after_writer(state) == "writer"


class TestRouteAfterChecker:
    def test_verified_goes_to_polisher(self):
        state = {"fastChecker": {"verified": True, "failed_facts": [], "checker_retry_count": 0}}
        assert route_after_checker(state) == "polisher"

    def test_no_failed_facts_goes_to_polisher(self):
        state = {"fastChecker": {"verified": False, "failed_facts": [], "checker_retry_count": 0}}
        assert route_after_checker(state) == "polisher"

    def test_failed_facts_within_retry_limit_goes_to_writer(self):
        state = {
            "fastChecker": {
                "verified": False,
                "failed_facts": ["fact 1"],
                "checker_retry_count": 0,
            }
        }
        assert route_after_checker(state) == "writer"

    def test_failed_facts_at_retry_limit_goes_to_polisher(self):
        state = {
            "fastChecker": {
                "verified": False,
                "failed_facts": ["fact 1"],
                "checker_retry_count": CHECKER_RETRY_LIMIT,
            }
        }
        assert route_after_checker(state) == "polisher"

    def test_empty_checker_blob_uses_defaults(self):
        state = {}
        assert route_after_checker(state) == "polisher"

    def test_verified_with_failed_facts_still_goes_to_polisher(self):
        state = {
            "fastChecker": {
                "verified": True,
                "failed_facts": ["fact 1"],
                "checker_retry_count": 0,
            }
        }
        assert route_after_checker(state) == "polisher"


class TestConstants:
    def test_writer_retry_limit(self):
        assert WRITER_RETRY_LIMIT == 3

    def test_checker_retry_limit(self):
        assert CHECKER_RETRY_LIMIT == 2

    def test_confidence_threshold(self):
        assert CHECKER_CONFIDENCE_THRESHOLD == 0.6

    def test_writer_min_chars(self):
        assert WRITER_DRAFT_MIN_CHARS == 100
