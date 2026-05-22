"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

const ACCEPTED = ".pdf,.docx,.doc";
const MAX_SIZE = 10 * 1024 * 1024;

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  onFileRemoved: () => void;
}

export function FileUpload({ onFileSelected, onFileRemoved }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function validate(f: File): boolean {
    if (f.size > MAX_SIZE) {
      setError("El archivo supera los 10 MB");
      return false;
    }
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError("Solo se aceptan archivos .pdf y .docx");
      return false;
    }
    return true;
  }

  function handleFile(f: File) {
    setError(null);
    if (!validate(f)) return;
    setFile(f);
    onFileSelected(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function remove() {
    setFile(null);
    setError(null);
    onFileRemoved();
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleChange}
        className="hidden"
      />

      {file ? (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm text-blue-700 truncate flex-1">{file.name}</span>
          <button
            onClick={remove}
            className="text-blue-400 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
            dragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50"
          }`}
        >
          <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm text-slate-500">
            {dragging ? "Soltá el archivo aquí" : "PDF o DOCX (máx 10 MB)"}
          </span>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
