import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { NewProjectChat } from "./components/NewProjectChat";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const { data: session } = await auth.token();
  console.log(session)

  if (!session?.token) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-950 border-b border-slate-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold  text-blue-600">New project</h1>
          <a
            href="/dashboard"
            className="text-sm text-slate-500 dark:text-gray-300 hover:text-slate-700 dark:hover:text-gray-100 transition-colors"
          >
            Volver al dashboard
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6">
        <NewProjectChat />
      </main>
    </div>
  );
}
