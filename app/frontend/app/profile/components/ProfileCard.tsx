"use client";

import { motion } from "framer-motion";
import { UserAvatar } from "@/app/dashboard/components/UserAvatar";
import { UserProfile } from "../types";

interface ProfileCardProps {
  user: UserProfile;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8"
    >
      <div className="flex flex-col items-center text-center mb-6">
        <UserAvatar
          imageUrl={user.image}
          name={user.name || user.email}
          size={96}
        />
        <h2 className="mt-4 text-xl font-semibold text-slate-900">
          {user.name || "No name set"}
        </h2>
        <p className="text-slate-500 text-sm">{user.email}</p>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">User ID</span>
          <span className="text-sm text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded">
            {user.id}
          </span>
        </div>

        {user.createdAt && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Member since</span>
            <span className="text-sm text-slate-700">
              {formatDate(user.createdAt)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
