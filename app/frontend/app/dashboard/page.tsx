import { auth } from "@/lib/auth/server";
import { getProjects } from "./actions";
import { ProjectsOverview, CreateProjectButton, UserAvatar } from "./components";

export const metadata = {
  title: "Dashboard - DataOps",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: session } = await auth.getSession();

  let totalProjects = 0;
  let isLoading = true;

  try {
    const data = await getProjects();
    totalProjects = data.projects.length;
    isLoading = false;
  } catch {
    isLoading = false;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          {session?.user && (
            <UserAvatar
              imageUrl={session.user.image}
              name={session.user.name || session.user.email}
              size={40}
            />
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ProjectsOverview totalProjects={totalProjects} isLoading={isLoading} />
          <div className="flex items-center">
            <CreateProjectButton />
          </div>
        </div>
      </div>
    </div>
  );
}
