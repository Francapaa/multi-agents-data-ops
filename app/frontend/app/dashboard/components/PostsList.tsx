"use client";

import { motion } from "framer-motion";
import type { RecentPostRow } from "../types";

interface PostsListProps {
  posts: RecentPostRow[];
  isLoading: boolean;
}

export function PostsList({ posts, isLoading }: PostsListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-md border border-slate-200 p-5"
    >
      <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">
        Últimos posts generados
      </p>
      {isLoading ? (
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Aún no hay posts.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {posts.map((p) => (
            <li key={p.post_id} className="py-3 first:pt-0">
              <p className="font-medium text-slate-900 line-clamp-1">
                {p.project_title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Proyecto · {p.project_status}
              </p>
              {p.final_post ? (
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {p.final_post}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
