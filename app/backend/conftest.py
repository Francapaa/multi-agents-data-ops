import pytest

"""mock data for test"""

@pytest.fixture
def sample_text() -> str:
    return (
        "# Sample Blog Post\n\n"
        "This is a sample blog post with enough content to pass validation.\n\n"
        "## Section 1\n\n"
        "Some content here.\n\n"
        "## Section 2\n\n"
        "More content here.\n\n"
        "### Conclusion\n\n"
        "This concludes the sample."
    )


@pytest.fixture
def short_text() -> str:
    return "Too short."


@pytest.fixture
def empty_text() -> str:
    return ""


@pytest.fixture
def sample_facts() -> list[str]:
    return [
        "Fact one: the sky is blue.",
        "Fact two: water is wet.",
        "Fact three: the earth is round.",
    ]
