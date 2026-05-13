"use server";

import { auth } from "@/lib/auth/server";
import { ProjectListResponse } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function getProjects(): Promise<ProjectListResponse> {
  const session = await auth.getSession();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${BACKEND_URL}/api/projects`, {
    headers: {
      Authorization: `Bearer ${session.data?.session.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
}
