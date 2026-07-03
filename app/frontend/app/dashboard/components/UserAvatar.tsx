"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface UserAvatarProps {
  imageUrl: string | null | undefined;
  name: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function UserAvatar({ imageUrl, name, size = 40 }: UserAvatarProps) {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="relative inline-block cursor-pointer"
      style={{ width: size, height: size }}
    >
      <Link href="/profile">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full rounded-full object-cover ring-2 ring-blue-100 hover:ring-blue-300 transition-all"
          />
        ) : (
          <div
            className={`w-full h-full rounded-full ${bgColor} flex items-center justify-center ring-2 ring-blue-100 hover:ring-blue-300 transition-all`}
          >
            <span
              className="text-white font-semibold select-none"
              style={{ fontSize: size * 0.35 }}
            >
              {initials}
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
