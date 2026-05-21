"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Project } from "../types";

const BACKEND_URL: string | undefined = process.env.NEXT_PUBLIC_BACKEND_URL;

interface UseProjectsReturn {
  projects: Project[];
  totalProjects: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProjects(accessToken: string | null): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);

  const fetchProjects = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }
    if (!BACKEND_URL){
      console.log("ENVIRONMENT VARIABLE DOESN'T EXIST");
      return; 
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.log(error)
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

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
