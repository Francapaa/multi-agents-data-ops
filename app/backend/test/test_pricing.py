from config.pricing import GEMINI_INPUT_USD_PER_TOKEN, GEMINI_OUTPUT_USD_PER_TOKEN


class TestPricingConstants:
    def test_input_token_price_is_positive(self):
        assert GEMINI_INPUT_USD_PER_TOKEN > 0

    def test_output_token_price_is_positive(self):
        assert GEMINI_OUTPUT_USD_PER_TOKEN > 0

    def test_output_costs_more_than_input(self):
        assert GEMINI_OUTPUT_USD_PER_TOKEN > GEMINI_INPUT_USD_PER_TOKEN

    def test_input_price_correct_value(self):
        assert GEMINI_INPUT_USD_PER_TOKEN == 0.075 / 1_000_000

    def test_output_price_correct_value(self):
        assert GEMINI_OUTPUT_USD_PER_TOKEN == 0.30 / 1_000_000
