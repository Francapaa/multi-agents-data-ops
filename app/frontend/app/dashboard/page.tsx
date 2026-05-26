import {redirect} from 'next/navigation'; 
import { auth } from "@/lib/auth/server";
import {
  CreateProjectButton,
  DashboardClient,
  UserAvatar,
} from "./components"; // componentes de dashboard

export const metadata = {
  title: "Dashboard - DataOps",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ stream?: string }>;
}) {
  const { data: session } = await auth.getSession();
  const sp = await searchParams;

  if (!session?.user){
    redirect('/auth/sign-in')
  }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-950 border-b border-slate-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          {session?.user?.image && (
            <UserAvatar
              imageUrl={session.user.image}
              name={session.user.name || session.user.email}
              size={40}
            />
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-6">
        <DashboardClient
          streamProjectId={sp.stream}
        />

        <div className="flex justify-center py-8 mt-8">
          <div className="w-full max-w-md">
            <CreateProjectButton />
          </div>
        </div>
      </div>
    </div>
  );
}
