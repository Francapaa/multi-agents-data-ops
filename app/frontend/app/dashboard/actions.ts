"use server";

import { auth } from "@/lib/auth/server";
import { ProjectListResponse } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function getProjects(): Promise<ProjectListResponse> {
  const session = await auth.getSession();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tokenResult = await auth.token();
  const token = tokenResult.data?.token ?? null;

  if (!token) {
    throw new Error("No token available");
  }

  const response = await fetch(`${BACKEND_URL}/projects`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
}
