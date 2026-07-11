import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { ProjectView } from "./components/ProjectView";

export const dynamic = "force-dynamic";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { data: session } = await auth.getSession();
  const { id } = await params;


  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const tokenResult = await auth.token();
  const token = tokenResult.data?.token ?? null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-950 border-b border-slate-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Proyecto</h1>
          <a
            href="/dashboard"
            className="text-sm text-slate-500 dark:text-gray-300 hover:text-slate-700 dark:hover:text-gray-100 transition-colors"
          >
            Volver al dashboard
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <ProjectView projectId={id} token={token} />
      </main>
    </div>
  );
}
