"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@neondatabase/auth/react";

export function AuthControls() {
  return (
    <>
      <SignedIn>
        <UserButton size="icon" />
      </SignedIn>
      <SignedOut>
        <Link
          href="/auth/sign-in"
          className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/sign-up"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Sign Up
        </Link>
      </SignedOut>
    </>
  );
}
