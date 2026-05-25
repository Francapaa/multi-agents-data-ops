"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { FileUpload } from "./FileUpload";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function NewProjectChat() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  function autoResize() {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const text = message.trim();
    if (!text && !file) return;

    setSubmitting(true);
    setError(null);

    try {
      const { data, error: sessionError } = await authClient.token({
        fetchOptions: {
          headers: { "X-Force-Fetch": "true" },
        },
      });
      console.log(data?.token); 
      if (sessionError || !data.token) {
        console.log(sessionError);
        setError("No se pudo autenticar");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("message", text);
      if (file) formData.append("file", file);

      const res = await fetch(`${BACKEND_URL}/api/projects/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${data.token}` },
        body: formData,
      });

      if (!res.ok) {
        console.log("ERROR")
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Error al crear el proyecto");
      }

      const project = await res.json();
      router.push(`/new-project/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            ¿What PRD you want to transform?
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Add your PRD and we will transform it into a blog post
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm pt-4 pb-6">
        {error && (
          <div className="max-w-2xl mx-auto mb-3 px-5 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-3">
          <FileUpload
            onFileSelected={(f) => setFile(f)}
            onFileRemoved={() => setFile(null)}
          />

          <div className="flex items-end gap-3 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 px-5 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
            <textarea
              ref={textRef}
              value={message}
              onChange={(e) => { setMessage(e.target.value); autoResize(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Escribí tu idea del proyecto..."
              rows={1}
              className="flex-1 resize-none outline-none text-sm text-slate-800 placeholder-slate-400 leading-relaxed max-h-[200px]"
            />

            <button
              type="submit"
              disabled={submitting || (!message.trim() && !file)}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Press Enter to send &middot; Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
