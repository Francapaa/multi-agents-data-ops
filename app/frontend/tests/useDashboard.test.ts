import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const mockToken = vi.fn();

vi.mock("@/lib/auth/client", () => ({
  authClient: { token: (...args: unknown[]) => mockToken(...args) },
}));

const ORIGINAL_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:8000";
  mockToken.mockResolvedValue({ data: { token: "test-token" }, error: null });
});

describe("useDashboard", () => {
  it("returns initial state from initialData when provided", async () => {
    const { useDashboard } = await import("../app/dashboard/hooks/useDashboard");
    const initialData = {
      overview: { total: 5, completed: 3, failed: 1, success_rate: 60 },
      costs: { input_tokens: 100, output_tokens: 50, avg_time_seconds: 30, cost_usd: 0.5 },
      health: { success_rate: 95, avg_retries: 0.2 },
      posts: [],
      partialErrors: {},
    };
    const { result } = renderHook(() => useDashboard(initialData));
    expect(result.current.loading).toBe(false);
    expect(result.current.overview?.total).toBe(5);
    expect(result.current.health?.success_rate).toBe(95);
  });

  it("starts loading when no initialData provided", async () => {
    const { useDashboard } = await import("../app/dashboard/hooks/useDashboard");
    const { result } = renderHook(() => useDashboard(null));
    expect(result.current.loading).toBe(true);
  });

  it("fetches metrics on mount when no initialData", async () => {
    const okJson = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
    const overviewData = { total: 10, completed: 5, failed: 0, success_rate: 100 };
    const costsData = { input_tokens: 200, output_tokens: 100, avg_time_seconds: 45, cost_usd: 1.0 };
    const healthData = { success_rate: 100, avg_retries: 0 };
    const postsData = { posts: [] };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(okJson(overviewData))
      .mockResolvedValueOnce(okJson(costsData))
      .mockResolvedValueOnce(okJson(healthData))
      .mockResolvedValueOnce(okJson(postsData));
    vi.stubGlobal("fetch", mockFetch);

    const { useDashboard } = await import("../app/dashboard/hooks/useDashboard");
    const { result } = renderHook(() => useDashboard(null));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.overview?.total).toBe(10);
    expect(result.current.costs?.cost_usd).toBe(1.0);
    expect(result.current.health?.success_rate).toBe(100);
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBeNull();

    vi.unstubAllGlobals();
  });

  it("sets partial errors when some fetches fail", async () => {
    const okJson = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(okJson({ total: 1, completed: 0, failed: 0, success_rate: 0 }))
      .mockRejectedValueOnce(new Error("Costs failed"))
      .mockResolvedValueOnce(okJson({ success_rate: 100, avg_retries: 0 }))
      .mockResolvedValueOnce(okJson({ posts: [] }));
    vi.stubGlobal("fetch", mockFetch);

    const { useDashboard } = await import("../app/dashboard/hooks/useDashboard");
    const { result } = renderHook(() => useDashboard(null));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.overview).not.toBeNull();
    expect(result.current.costs).toBeNull();
    expect(result.current.partialErrors.costs).toBe("Costs failed");
    expect(result.current.error).toBeNull();

    vi.unstubAllGlobals();
  });

  it("sets global error when all 4 fetches fail", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Everything failed"));
    vi.stubGlobal("fetch", mockFetch);

    const { useDashboard } = await import("../app/dashboard/hooks/useDashboard");
    const { result } = renderHook(() => useDashboard(null));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.overview).toBeNull();
    expect(result.current.costs).toBeNull();
    expect(result.current.health).toBeNull();
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBe("No se pudieron cargar las métricas");

    vi.unstubAllGlobals();
  });

  it("refetch re-fetches all metrics", async () => {
    const okJson = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      return okJson({ total: callCount, completed: 0, failed: 0, success_rate: 0 });
    });
    vi.stubGlobal("fetch", mockFetch);

    const { useDashboard } = await import("../app/dashboard/hooks/useDashboard");
    const { result } = renderHook(() => useDashboard(null));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.overview?.total).toBe(1);

    mockFetch.mockClear();
    mockFetch
      .mockResolvedValueOnce(okJson({ total: 2, completed: 1, failed: 0, success_rate: 50 }))
      .mockResolvedValueOnce(okJson(costsData()))
      .mockResolvedValueOnce(okJson(healthData()))
      .mockResolvedValueOnce(okJson({ posts: [] }));

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.overview?.total).toBe(2));

    vi.unstubAllGlobals();

    function costsData() {
      return { input_tokens: 0, output_tokens: 0, avg_time_seconds: 0, cost_usd: 0 };
    }
    function healthData() {
      return { success_rate: 0, avg_retries: 0 };
    }
  });
});
