import { describe, it, expect } from "vitest";
import {
  parseSseBlocks,
  calculateNextStep,
  parsePayload,
} from "../app/dashboard/utils/parseSSEBlocks";
import type { StreamState } from "../app/dashboard/types";

describe("parseSseBlocks", () => {
  it("parses a single event block", () => {
    const input = "event: status\ndata: {\"status\":\"running\"}\n\n";
    const { events, rest } = parseSseBlocks(input);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe("status");
    expect(events[0].data).toBe('{"status":"running"}');
    expect(rest).toBe("");
  });

  it("parses multiple event blocks", () => {
    const input =
      "event: status\ndata: {\"status\":\"running\"}\n\nevent: complete\ndata: {\"done\":true}\n\n";
    const { events, rest } = parseSseBlocks(input);
    expect(events).toHaveLength(2);
    expect(events[0].event).toBe("status");
    expect(events[1].event).toBe("complete");
    expect(rest).toBe("");
  });

  it("returns leftover in rest when trailing newlines are missing", () => {
    const input = "event: status\ndata: {\"x\":1}\n\nincomplete";
    const { events, rest } = parseSseBlocks(input);
    expect(events).toHaveLength(1);
    expect(rest).toBe("incomplete");
  });

  it("skips comment lines starting with colon", () => {
    const input = ": ping\n\nevent: status\ndata: {\"a\":1}\n\n";
    const { events } = parseSseBlocks(input);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe("status");
  });

  it("defaults event type to 'message' when event field is missing", () => {
    const input = "data: {\"x\":1}\n\n";
    const { events } = parseSseBlocks(input);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe("message");
  });

  it("returns empty events for empty buffer", () => {
    const { events, rest } = parseSseBlocks("");
    expect(events).toHaveLength(0);
    expect(rest).toBe("");
  });

  it("handles data spanning multiple data lines", () => {
    const input = "event: msg\ndata: line1\ndata: line2\n\n";
    const { events } = parseSseBlocks(input);
    expect(events).toHaveLength(1);
    expect(events[0].data).toBe("line1\nline2");
  });

  it("skips blocks with no data", () => {
    const input = "event: ping\n\n";
    const { events } = parseSseBlocks(input);
    expect(events).toHaveLength(0);
  });
});

describe("calculateNextStep", () => {
  const baseState: StreamState = {
    status: null,
    progress: null,
    complete: null,
    error: null,
  };

  it("updates status and progress on status event", () => {
    const result = calculateNextStep(baseState, "status", {
      status: "researching",
      progress: 50,
    });
    expect(result.status).toBe("researching");
    expect(result.progress).toBe(50);
  });

  it("preserves current state values when payload fields are missing", () => {
    const current = { ...baseState, status: "writing", progress: 30 };
    const result = calculateNextStep(current, "status", {
      status: undefined as unknown as string,
      progress: undefined as unknown as number,
    });
    expect(result.status).toBe("writing");
    expect(result.progress).toBe(30);
  });

  it("sets complete and progress 100 on complete event", () => {
    const payload = {
      total_input_tokens: 100,
      total_output_tokens: 50,
      execution_time: 30,
    };
    const result = calculateNextStep(baseState, "complete", payload);
    expect(result.complete).toEqual(payload);
    expect(result.progress).toBe(100);
  });

  it("sets error message from ErrorPayload with detail field", () => {
    const result = calculateNextStep(baseState, "error", { detail: "Something failed" });
    expect(result.error).toContain("Something failed");
  });

  it("returns empty object for unknown event", () => {
    const result = calculateNextStep(baseState, "unknown", null);
    expect(result).toEqual({});
  });
});

describe("parsePayload", () => {
  it("parses valid JSON", () => {
    const result = parsePayload('{"key":"value"}');
    expect(result).toEqual({ key: "value" });
  });

  it("returns raw string for invalid JSON", () => {
    const result = parsePayload("not-json");
    expect(result).toBe("not-json");
  });
});
