"use client";

import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { StreamState, Event, StreamPayload } from "../types";
import { parseSseBlocks, calculateNextStep, parsePayload} from "../utils/parseSSEBlocks";


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;



export function useProjectStream(
  projectId: string | null | undefined,
  onUpdate?: (event: string, payload: unknown) => void,
) {
  const [state, setState] = useState<StreamState>({
    status: null,
    progress: null,
    complete: null,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!projectId || !BACKEND_URL) return;

    const ac = new AbortController();
    abortRef.current = ac;
    let buf = "";
    let cancelled = false;

    (async () => {
      console.log("[SSE] Fetching auth token...");
      const { data, error } = await authClient.token();
      if (error) console.error("[SSE] authClient.token() error:", error);
      if (!data?.token) console.warn("[SSE] No token returned, data:", data);
      if(error)console.error("ERROR: ", error)  
      console.log("TOKEN: ", data?.token)
      if (cancelled || error || !data?.token) {
        setState((s) => ({ ...s, error: "Authentication failed — no token" }));
        return;
      }
      const token = data.token;
      console.log("[SSE] Token obtained, connecting to stream...");

      try {
        const url = `${BACKEND_URL}/api/projects/${projectId}/stream`;
        console.log("[SSE] Fetching:", url);
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });
        console.log("[SSE] Response status:", res.status, res.statusText);
        if (!res.ok || !res.body) {
          console.error("[SSE] Stream failed with status:", res.status);
          setState((s) => ({
            ...s,
            error: `Stream failed (${res.status})`,
          }));
          return;
        }
        console.log(" [SSE] Connected, reading stream...");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += decoder.decode(value, { stream: true });
          const { events, rest } = parseSseBlocks(buf);
          buf = rest;

          for (const { event, data: rawData } of events) {
            console.log("[SSE] Event received:", event, rawData.slice(0, 120));
            const payload = parsePayload(rawData) as StreamPayload

            onUpdateRef.current?.(event, payload);
            /*if (event === "status" && payload && typeof payload === "object") {
              const p = payload as { status?: string; progress?: number };
              setState((s) => ({
                ...s,
                status: p.status ?? s.status,
                progress: typeof p.progress === "number" ? p.progress : s.progress,
              }));
            }
            if (event === "complete" && payload && typeof payload === "object") {
              const p = payload as StreamState["complete"];
              setState((s) => ({
                ...s,
                complete: p ?? null,
                progress: 100,
              }));
              finished = true
            }
            if (event === "error") {
              const msg =
                payload && typeof payload === "object" && "detail" in payload
                  ? String((payload as { detail: unknown }).detail)
                  : String(payload);
              setState((s) => ({ ...s, error: msg }));
              finished = true // finaliza pero por error
            }*/
           setState((currentState) => ({
            ...currentState,
            ...calculateNextStep(currentState, event, payload) // set the state only with the function
           }))
          
          }
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          console.log("[SSE] Aborted");
          return;
        }
        console.error("[SSE] Fetch error:", e);
        setState((s) => ({
          ...s,
          error: e instanceof Error ? e.message : "Stream error",
        }));
      }
    })();

    return () => { cancelled = true; ac.abort(); };
  }, [projectId]);

  return state;
}
