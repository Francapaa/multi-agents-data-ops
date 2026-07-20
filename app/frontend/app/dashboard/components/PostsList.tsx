"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { RecentPostRow } from "../types";

interface PostsListProps {
  posts: RecentPostRow[];
  isLoading: boolean;
}

const easeOut = [0.23, 1, 0.32, 1] as const;

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easeOut },
  },
};

export function PostsList({ posts, isLoading }: PostsListProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className="glass-card rounded-2xl p-6"
      initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeOut, delay: 0.08 }}
    >
      <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
        Recent Generated Posts
      </p>
      {isLoading ? (
        <div className="mt-3 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-slate-100 dark:bg-gray-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-gray-400">No posts yet.</p>
      ) : (
        <motion.ul
          className="mt-3 divide-y divide-slate-100 dark:divide-gray-800"
          variants={shouldReduce ? undefined : listVariants}
          initial={shouldReduce ? undefined : "hidden"}
          animate={shouldReduce ? undefined : "visible"}
        >
          {posts.map((p) => (
            <motion.li
              key={p.post_id}
              variants={shouldReduce ? undefined : itemVariants}
            >
              <Link
                href={`/new-project/${p.project_id}/result`}
                className="block py-3 first:pt-0 -mx-6 px-6 rounded-lg transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-white/5"
              >
                <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                  {p.project_title}
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Proyecto · {p.project_status}
                </p>
                {p.final_post ? (
                  <p className="text-sm text-slate-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {p.final_post}
                  </p>
                ) : null}
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </motion.div>
  );
}
