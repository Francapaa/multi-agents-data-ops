/** Precios aproximados Gemini 1.5 Flash (USD por token) */
export const GEMINI_COST = {
  input: 0.075 / 1_000_000,
  output: 0.3 / 1_000_000,
} as const;

export function estimateCostUsd(inputTokens: number, outputTokens: number): number {
  return inputTokens * GEMINI_COST.input + outputTokens * GEMINI_COST.output;
}
