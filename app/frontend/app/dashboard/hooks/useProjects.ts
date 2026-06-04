"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Project, UseProjectsReturn } from "../types";
import { authClient } from "@/lib/auth/client";

const BACKEND_URL: string | undefined = process.env.NEXT_PUBLIC_BACKEND_URL;

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);

  const fetchProjects = useCallback(async () => {
    if (!BACKEND_URL){
      console.log("ENVIRONMENT VARIABLE DOESN'T EXIST");
      return; 
    }

    const { data: tokenData, error: tokenError } = await authClient.token();
    if (tokenError || !tokenData?.token) {
      setIsLoading(false);
      setError(tokenError?.message ?? "No se pudo obtener el token de autenticación");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const result = await response.json();
      setProjects(result.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      fetchProjects();
    }
  }, [fetchProjects]);

  return {
    projects,
    totalProjects: projects.length,
    isLoading,
    error,
    refetch: fetchProjects,
  };
}
