import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { ResultContent } from "./components";
import { ProjectResult } from "./types";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { data: session } = await auth.getSession();
  const { id } = await params;

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const tokenResult = await auth.token();
  const token = tokenResult.data?.token ?? null;

  if (!token) {
    redirect("/auth/sign-in");
  }

  const res = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/dashboard");
  }

  const data = await res.json();

  const project: ProjectResult = {
    id: data.id,
    title: data.title,
    status: data.status,
    created_at: data.created_at,
    final_post: data.post?.final_post ?? null,
    total_input_tokens: data.total_input_tokens,
    total_output_tokens: data.total_output_tokens,
    execution_time_seconds: data.execution_time_seconds,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-950 border-b border-slate-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Resultado</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <ResultContent project={project} />
      </main>
    </div>
  );
}
