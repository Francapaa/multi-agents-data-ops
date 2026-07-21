import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const mockGetSession = vi.fn();

vi.mock("@/lib/auth/client", () => ({
  authClient: { getSession: (...args: unknown[]) => mockGetSession(...args) },
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:8000";
  mockGetSession.mockResolvedValue({
    data: { session: { token: "session-token" } },
    error: null,
  });
});

function createMockStream(chunks: string[]) {
  let index = 0;
  const encoder = new TextEncoder();
  return {
    getReader() {
      return {
        read: vi.fn().mockImplementation(() => {
          if (index < chunks.length) {
            const value = encoder.encode(chunks[index]);
            index++;
            return Promise.resolve({ done: false, value });
          }
          return Promise.resolve({ done: true, value: undefined });
        }),
        cancel: vi.fn(),
        releaseLock: vi.fn(),
        closed: Promise.resolve(undefined),
      };
    },
  };
}

describe("useProjectStream", () => {
  it("does nothing when projectId is null", async () => {
    const { useProjectStream } = await import(
      "../app/dashboard/hooks/useProjectStream"
    );
    const { result } = renderHook(() => useProjectStream(null));
    expect(result.current.status).toBeNull();
    expect(result.current.progress).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("connects and updates state from SSE events", async () => {
    const streamBody = createMockStream([
      "event: status\ndata: {\"status\":\"researching\",\"progress\":30}\n\n" +
      "event: status\ndata: {\"status\":\"writing\",\"progress\":60}\n\n" +
      "event: complete\ndata: {\"total_input_tokens\":100,\"total_output_tokens\":50,\"execution_time\":30}\n\n",
    ]);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: streamBody,
    });
    vi.stubGlobal("fetch", mockFetch);

    const { useProjectStream } = await import(
      "../app/dashboard/hooks/useProjectStream"
    );
    const { result } = renderHook(() =>
      useProjectStream("proj-123"),
    );

    await waitFor(() => {
      expect(result.current.status).toBe("writing");
      expect(result.current.progress).toBe(100);
      expect(result.current.complete?.total_input_tokens).toBe(100);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/projects/proj-123/stream",
      expect.objectContaining({
        headers: { Authorization: "Bearer session-token" },
      }),
    );

    vi.unstubAllGlobals();
  });

  it("sets error when stream returns non-ok status", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });
    vi.stubGlobal("fetch", mockFetch);

    const { useProjectStream } = await import(
      "../app/dashboard/hooks/useProjectStream"
    );
    const { result } = renderHook(() => useProjectStream("proj-999"));

    await waitFor(() =>
      expect(result.current.error).toContain("Stream failed (404)"),
    );

    vi.unstubAllGlobals();
  });

  it("sets error when auth fails", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: { message: "Not authenticated" },
    });

    const { useProjectStream } = await import(
      "../app/dashboard/hooks/useProjectStream"
    );
    const { result } = renderHook(() => useProjectStream("proj-123"));

    await waitFor(() =>
      expect(result.current.error).toContain("no token"),
    );
  });

  it("calls onUpdate callback when events arrive", async () => {
    const streamBody = createMockStream([
      "event: status\ndata: {\"status\":\"writing\"}\n\n",
    ]);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: streamBody,
    });
    vi.stubGlobal("fetch", mockFetch);

    const onUpdate = vi.fn();

    const { useProjectStream } = await import(
      "../app/dashboard/hooks/useProjectStream"
    );
    renderHook(() => useProjectStream("proj-123", onUpdate));

    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
    expect(onUpdate).toHaveBeenCalledWith("status", { status: "writing" });

    vi.unstubAllGlobals();
  });

  it("uses provided token when given", async () => {
    const streamBody = createMockStream([
      "event: status\ndata: {\"status\":\"done\"}\n\n",
    ]);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: streamBody,
    });
    vi.stubGlobal("fetch", mockFetch);

    const { useProjectStream } = await import(
      "../app/dashboard/hooks/useProjectStream"
    );
    renderHook(() => useProjectStream("proj-123", undefined, "provided-token"));

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].headers.Authorization).toBe("Bearer provided-token");

    vi.unstubAllGlobals();
  });
});
