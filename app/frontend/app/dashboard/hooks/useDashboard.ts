"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  MetricsCosts,
  MetricsHealth,
  MetricsOverview,
  RecentPostRow,
  PartialErrors,
  DashboardState,
  DashboardAction,
  UseDashboardReturn,
} from "../types";
import { authClient } from "@/lib/auth/client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


async function waitForToken(TimeOut = 5000){
  const start = Date.now()

  while (Date.now() - start < TimeOut){
    const {data} = await authClient.token();

    if (data?.token){
      return data.token
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  return null
}



const initialState: DashboardState = {
  overview: null,
  costs: null,
  health: null,
  posts: [],
  loading: true,
  error: null,
  partialErrors: {},
};

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null, partialErrors: {} };
    case "LOAD_END":
      return { ...state, loading: false };
    case "LOAD_COMPLETE":
      return {
        ...state,
        overview: action.payload.overview,
        costs: action.payload.costs,
        health: action.payload.health,
        posts: action.payload.posts,
        partialErrors: action.payload.partialErrors,
        loading: false,
        error: action.payload.allFailed
          ? "No se pudieron cargar las métricas"
          : null,
      };
    case "SET_ERROR":
      return { ...state, loading: false, error: action.payload };
  }
}

export function useDashboard(): UseDashboardReturn {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const initialized = useRef(false);

  const fetchMetrics = useCallback(async () => {
    if (!BACKEND_URL) {
      dispatch({ type: "LOAD_END" });
      return;
    }

    const token = await waitForToken();

    if (!token) {
      dispatch({ type: "LOAD_END" });
      return;
    }

    dispatch({ type: "LOAD_START" });

    const headers = { Authorization: `Bearer ${token}` };

    const results = await Promise.allSettled([
      fetch(`${BACKEND_URL}/api/metrics/overview`, { headers, cache: "no-store" })
        .then((r) => { if (!r.ok) throw new Error("Error al cargar overview"); return r.json() as Promise<MetricsOverview>; }),
      fetch(`${BACKEND_URL}/api/metrics/costs`, { headers, cache: "no-store" })
        .then((r) => { if (!r.ok) throw new Error("Error al cargar costs"); return r.json() as Promise<MetricsCosts>; }),
      fetch(`${BACKEND_URL}/api/metrics/health`, { headers, cache: "no-store" })
        .then((r) => { if (!r.ok) throw new Error("Error al cargar health"); return r.json() as Promise<MetricsHealth>; }),
      fetch(`${BACKEND_URL}/api/metrics/recent-posts`, { headers, cache: "no-store" })
        .then((r) => { if (!r.ok) throw new Error("Error al cargar posts"); return r.json() as Promise<{ posts: RecentPostRow[] }>; }),
    ]);

    const [overviewResult, costsResult, healthResult, postsResult] = results;

    const partialErrors: PartialErrors = {};
    if (overviewResult.status === "rejected") partialErrors.overview = overviewResult.reason.message;
    if (costsResult.status === "rejected") partialErrors.costs = costsResult.reason.message;
    if (healthResult.status === "rejected") partialErrors.health = healthResult.reason.message;
    if (postsResult.status === "rejected") partialErrors.posts = postsResult.reason.message;

    dispatch({
      type: "LOAD_COMPLETE",
      payload: {
        overview: overviewResult.status === "fulfilled" ? overviewResult.value : null,
        costs: costsResult.status === "fulfilled" ? costsResult.value : null,
        health: healthResult.status === "fulfilled" ? healthResult.value : null,
        posts: postsResult.status === "fulfilled" ? postsResult.value.posts ?? [] : [],
        partialErrors,
        allFailed: Object.keys(partialErrors).length === 4,
      },
    });
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchMetrics();
    }
  }, [fetchMetrics]);

  return {
    overview: state.overview,
    costs: state.costs,
    health: state.health,
    posts: state.posts,
    loading: state.loading,
    error: state.error,
    partialErrors: state.partialErrors,
    refetch: fetchMetrics,
  };
}
