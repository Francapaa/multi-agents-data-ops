import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockPush = vi.fn();
const mockToken = vi.fn();

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    token: (...args: unknown[]) => mockToken(...args),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const ORIGINAL_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:8000";
});

describe("useNewProjectChat", () => {
  it("returns initial state with default values", async () => {
    const { useNewProjectChat } = await import(
      "../app/new-project/hooks/useNewProjectChat"
    );
    const { result } = renderHook(() => useNewProjectChat());
    expect(result.current.state.message).toBe("");
    expect(result.current.state.file).toBeNull();
    expect(result.current.state.submitting).toBe(false);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.audience).toBe("b2c");
    expect(result.current.state.customAudience).toBe("");
  });

  it("sets message via dispatch", async () => {
    const { useNewProjectChat } = await import(
      "../app/new-project/hooks/useNewProjectChat"
    );
    const { result } = renderHook(() => useNewProjectChat());
    act(() => {
      result.current.dispatch({
        type: "SET_MESSAGE",
        payload: "Build a todo app",
      });
    });
    expect(result.current.state.message).toBe("Build a todo app");
  });

  it("sets audience via dispatch", async () => {
    const { useNewProjectChat } = await import(
      "../app/new-project/hooks/useNewProjectChat"
    );
    const { result } = renderHook(() => useNewProjectChat());
    act(() => {
      result.current.dispatch({ type: "SET_AUDIENCE", payload: "b2b" });
    });
    expect(result.current.state.audience).toBe("b2b");
  });

  it("sets customAudience via dispatch", async () => {
    const { useNewProjectChat } = await import(
      "../app/new-project/hooks/useNewProjectChat"
    );
    const { result } = renderHook(() => useNewProjectChat());
    act(() => {
      result.current.dispatch({
        type: "SET_CUSTOM_AUDIENCE",
        payload: "developers",
      });
    });
    expect(result.current.state.customAudience).toBe("developers");
  });

  it("handleSubmit does nothing when message and file are empty", async () => {
    const { useNewProjectChat } = await import(
      "../app/new-project/hooks/useNewProjectChat"
    );
    const { result } = renderHook(() => useNewProjectChat());
    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });
    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    expect(mockToken).not.toHaveBeenCalled();
  });

  it("handleSubmit with valid message calls auth and redirects", async () => {
    mockToken.mockResolvedValue({
      data: { token: "valid-token" },
      error: null,
    });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "proj-123" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { useNewProjectChat } = await import(
      "../app/new-project/hooks/useNewProjectChat"
    );
    const { result } = renderHook(() => useNewProjectChat());

    act(() => {
      result.current.dispatch({
        type: "SET_MESSAGE",
        payload: "Build a todo app",
      });
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(mockToken).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/projects/upload",
      expect.objectContaining({ method: "POST" }),
    );
    expect(mockPush).toHaveBeenCalledWith("/new-project/proj-123");

    vi.unstubAllGlobals();
  });

  it("handleSubmit sets error when auth fails", async () => {
    mockToken.mockResolvedValue({
      data: null,
      error: { message: "Auth failed" },
    });

    const { useNewProjectChat } = await import(
      "../app/new-project/hooks/useNewProjectChat"
    );
    const { result } = renderHook(() => useNewProjectChat());

    act(() => {
      result.current.dispatch({
        type: "SET_MESSAGE",
        payload: "Build something",
      });
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.state.error).toBe("No se pudo autenticar");
    expect(result.current.state.submitting).toBe(false);
  });

  it("handleSubmit sets error on network failure", async () => {
    mockToken.mockResolvedValue({
      data: { token: "valid-token" },
      error: null,
    });
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", mockFetch);

    const { useNewProjectChat } = await import(
      "../app/new-project/hooks/useNewProjectChat"
    );
    const { result } = renderHook(() => useNewProjectChat());

    act(() => {
      result.current.dispatch({
        type: "SET_MESSAGE",
        payload: "Build something",
      });
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent<HTMLFormElement>;
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.state.error).toBe("Network error");
    expect(result.current.state.submitting).toBe(false);

    vi.unstubAllGlobals();
  });
});
