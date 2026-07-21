"use client";

import { FileUpload } from "./FileUpload";
import { useNewProjectChat } from "../hooks/useNewProjectChat";

export function NewProjectChat() {
  const { state, dispatch, textRef, autoResize, handleSubmit } =
    useNewProjectChat();

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl text-center">
          <h2 className="text-2xl font-bold dark:text-white  text-slate-900 mb-2">
            ¿What PRD you want to transform?
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Add your PRD and we will transform it into a blog post
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white/80 dark:bg-gray-950 backdrop-blur-sm pt-4 pb-6">
        {state.error && (
          <div className="max-w-2xl mx-auto mb-3 px-5 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-500 mr-1">Para:</span>
            {(["b2c", "b2b", "other"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  dispatch({ type: "SET_AUDIENCE", payload: opt })
                }
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  state.audience === opt
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {opt === "b2c" ? "B2C" : opt === "b2b" ? "B2B" : "Otro"}
              </button>
            ))}
            {state.audience === "other" && (
              <input
                type="text"
                value={state.customAudience}
                onChange={(e) =>
                  dispatch({
                    type: "SET_CUSTOM_AUDIENCE",
                    payload: e.target.value,
                  })
                }
                placeholder="Ej: inversores, developers..."
                className="ml-1 px-3 py-1.5 text-xs border border-slate-200 rounded-full outline-none focus:border-blue-400 w-44"
              />
            )}
          </div>

          <FileUpload
            onFileSelected={(f) =>
              dispatch({ type: "SET_FILE", payload: f })
            }
            onFileRemoved={() =>
              dispatch({ type: "SET_FILE", payload: null })
            }
          />

          <div className="flex items-end gap-3 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 px-5 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
            <textarea
              ref={textRef}
              value={state.message}
              onChange={(e) => {
                dispatch({ type: "SET_MESSAGE", payload: e.target.value });
                autoResize();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Escribí tu idea del proyecto..."
              rows={1}
              className="flex-1 resize-none outline-none text-sm text-slate-800 placeholder-slate-400 leading-relaxed max-h-200px"
            />

            <button
              type="submit"
              disabled={
                state.submitting || (!state.message.trim() && !state.file)
              }
              className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed"
            >
              {state.submitting ? (
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
