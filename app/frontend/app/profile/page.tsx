import { auth } from "@/lib/auth/server";
import { BackButton } from "@/lib/components/ui";
import { ProfileCard } from "./components";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile - DataOps",
};

export default async function ProfilePage() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-slate-500 dark:text-gray-300">Not authenticated</p>
      </div>
    );
  }

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
    createdAt: session.user.createdAt?.toString() || new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <div className="max-w-md mx-auto py-12 px-6">
        <BackButton />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 mt-4">Profile</h1>
        <ProfileCard user={user} />
      </div>
    </div>
  );
}
