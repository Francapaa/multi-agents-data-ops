"use client";

import { useEffect, useRef, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type StreamState = {
  status: string | null;
  progress: number | null;
  complete: {
    total_input_tokens: number;
    total_output_tokens: number;
    execution_time: number;
  } | null;
  error: string | null;
};

type Event ={
  event: string,
  data: string
}


function parseSseBlocks(buffer: string): { events:Event[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const events: Event[] = [];
  for (const block of parts) {
    if (!block.trim() || block.startsWith(":")) continue;
    let event = "message";
    const dataLines: string[] = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    const data = dataLines.join("\n");
    if (data) events.push({ event, data });
  }
  return { events, rest };
}

export function useProjectStream(
  projectId: string | null | undefined,
  accessToken: string | null,
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
    if (!projectId || !accessToken || !BACKEND_URL) return;

    const ac = new AbortController();
    abortRef.current = ac;
    let buf = "";

    (async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/projects/${projectId}/stream`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: ac.signal,
          },
        );
        if (!res.ok || !res.body) {
          setState((s) => ({
            ...s,
            error: `Stream failed (${res.status})`,
          }));
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let finished = false
        while (true) {
          const { done, value } = await reader.read();
          if (done || finished) break;
          buf += decoder.decode(value, { stream: true });
          const { events, rest } = parseSseBlocks(buf);
          buf = rest;
          for (const { event, data } of events) {
            let payload: unknown = data;
            try {
              payload = JSON.parse(data);
            } catch {
              /* texto plano */
            }
            onUpdateRef.current?.(event, payload);
            if (event === "status" && payload && typeof payload === "object") {
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
            }
          }
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setState((s) => ({
          ...s,
          error: e instanceof Error ? e.message : "Stream error",
        }));
      }
    })();

    return () => ac.abort();
  }, [projectId, accessToken]);

  return state;
}
