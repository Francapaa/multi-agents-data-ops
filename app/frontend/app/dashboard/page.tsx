import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from "@/lib/auth/server";
import {
  CreateProjectButton,
  DashboardClient,
  UserAvatar,
} from "./components";
import {
  DashboardInitialData,
  MetricsCosts,
  MetricsHealth,
  MetricsOverview,
  PartialErrors,
  RecentPostRow,
} from "./types";

export const metadata = {
  title: "Dashboard - PRD2Post",
};

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function fetchMetricsServer(token: string): Promise<DashboardInitialData> {
  const authHeaders = { Authorization: `Bearer ${token}` };
  const partialErrors: PartialErrors = {};

  const results = await Promise.allSettled([
    fetch(`${BACKEND_URL}/api/metrics/overview`, { headers: authHeaders, cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(`overview ${r.status}`); return r.json() as Promise<MetricsOverview>; }),
    fetch(`${BACKEND_URL}/api/metrics/costs`, { headers: authHeaders, cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(`costs ${r.status}`); return r.json() as Promise<MetricsCosts>; }),
    fetch(`${BACKEND_URL}/api/metrics/health`, { headers: authHeaders, cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(`health ${r.status}`); return r.json() as Promise<MetricsHealth>; }),
    fetch(`${BACKEND_URL}/api/metrics/recent-posts`, { headers: authHeaders, cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(`posts ${r.status}`); return r.json() as Promise<{ posts: RecentPostRow[] }>; }),
  ]);

  const [overviewResult, costsResult, healthResult, postsResult] = results;

  if (overviewResult.status === "rejected") partialErrors.overview = String(overviewResult.reason);
  if (costsResult.status === "rejected") partialErrors.costs = String(costsResult.reason);
  if (healthResult.status === "rejected") partialErrors.health = String(healthResult.reason);
  if (postsResult.status === "rejected") partialErrors.posts = String(postsResult.reason);

  return {
    overview: overviewResult.status === "fulfilled" ? overviewResult.value : null,
    costs: costsResult.status === "fulfilled" ? costsResult.value : null,
    health: healthResult.status === "fulfilled" ? healthResult.value : null,
    posts: postsResult.status === "fulfilled" ? postsResult.value.posts ?? [] : [],
    partialErrors,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ stream?: string }>;
}) {
  const { data: session } = await auth.getSession();
  const sp = await searchParams;

  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  let initialData: DashboardInitialData | null = null;
  const tokenResult = await auth.token();
  const token = tokenResult.data?.token ?? null;
  if (token) {
    initialData = await fetchMetricsServer(token);
  }

  return (
    <div className="min-h-screen mesh-bg noise-overlay">
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Gradient header */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent" />
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-40 dark:opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 60%)",
              filter: "blur(60px)",
            }}
          />
          <div className="relative max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
            <div>
              <Link href="/" className="text-2xl font-bold text-blue-600 font-display tracking-tight">
                PRD2Post
              </Link>
              <h1 className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Dashboard</h1>
            </div>
            {session?.user?.image && (
              <UserAvatar
                imageUrl={session.user.image}
                name={session.user.name || session.user.email}
                size={40}
              />
            )}
          </div>
        </header>

        <div className="flex-1 max-w-4xl mx-auto w-full py-10 px-6">
          <DashboardClient
            streamProjectId={sp.stream}
            initialData={initialData}
            token={token}
          />

          <div className="flex justify-center py-8 mt-8">
            <div className="w-full max-w-md">
              <CreateProjectButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
