import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

const mockToken = vi.fn();

vi.mock("@/lib/auth/client", () => ({
  authClient: { token: (...args: unknown[]) => mockToken(...args) },
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:8000";
  mockToken.mockResolvedValue({ data: { token: "test-token" }, error: null });
});

describe("useProjects", () => {
  it("starts loading and fetches projects on mount", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          projects: [
            { id: "1", title: "Project 1", status: "completed", created_at: "2026-01-01", post: null },
          ],
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { useProjects } = await import("../app/dashboard/hooks/useProjects");
    const { result } = renderHook(() => useProjects());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].title).toBe("Project 1");
    expect(result.current.totalProjects).toBe(1);
    expect(result.current.error).toBeNull();

    vi.unstubAllGlobals();
  });

  it("sets error on fetch failure", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network failure"));
    vi.stubGlobal("fetch", mockFetch);

    const { useProjects } = await import("../app/dashboard/hooks/useProjects");
    const { result } = renderHook(() => useProjects());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Network failure");
    expect(result.current.projects).toEqual([]);

    vi.unstubAllGlobals();
  });

  it("sets error when auth token fails", async () => {
    mockToken.mockResolvedValue({
      data: null,
      error: { message: "Token error" },
    });

    const { useProjects } = await import("../app/dashboard/hooks/useProjects");
    const { result } = renderHook(() => useProjects());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toContain("Token error");
  });

  it("refetch re-fetches projects", async () => {
    let count = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      count++;
      const id = String(count);
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            projects: [
              { id, title: `Project ${id}`, status: "completed", created_at: "2026-01-01", post: null },
            ],
          }),
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    const { useProjects } = await import("../app/dashboard/hooks/useProjects");
    const { result } = renderHook(() => useProjects());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.projects[0].id).toBe("1");

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.projects[0].id).toBe("2"));

    vi.unstubAllGlobals();
  });
});
