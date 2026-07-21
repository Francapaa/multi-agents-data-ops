"use client";

import { useReducer, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import type { FormState, FormAction } from "../types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const INITIAL_STATE: FormState = {
  message: "",
  file: null,
  submitting: false,
  error: null,
  audience: "b2c",
  customAudience: "",
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_MESSAGE":
      return { ...state, message: action.payload };
    case "SET_FILE":
      return { ...state, file: action.payload };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_AUDIENCE":
      return { ...state, audience: action.payload };
    case "SET_CUSTOM_AUDIENCE":
      return { ...state, customAudience: action.payload };
  }
}

export function useNewProjectChat() {
  const router = useRouter();
  const [state, dispatch] = useReducer(formReducer, INITIAL_STATE);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const text = state.message.trim();
      if (!text && !state.file) return;

      dispatch({ type: "SET_SUBMITTING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const { data, error: sessionError } = await authClient.token({
          fetchOptions: {
            headers: { "X-Force-Fetch": "true" },
          },
        });

        if (sessionError || !data.token) {
          dispatch({ type: "SET_ERROR", payload: "No se pudo autenticar" });
          dispatch({ type: "SET_SUBMITTING", payload: false });
          return;
        }

        const formData = new FormData();
        formData.append("message", text);
        if (state.file) formData.append("file", state.file);
        formData.append(
          "audience",
          state.audience === "other"
            ? state.customAudience.trim() || "b2c"
            : state.audience,
        );

        const res = await fetch(`${BACKEND_URL}/api/projects/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${data.token}` },
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Error al crear el proyecto");
        }

        const project = await res.json();
        router.push(`/new-project/${project.id}`);
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err instanceof Error ? err.message : "Error inesperado",
        });
        dispatch({ type: "SET_SUBMITTING", payload: false });
      }
    },
    [state.message, state.file, state.audience, state.customAudience, router],
  );

  return {
    state,
    dispatch,
    textRef,
    autoResize,
    handleSubmit,
  };
}
