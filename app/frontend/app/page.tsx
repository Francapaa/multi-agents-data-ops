import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@neondatabase/auth/react";

export const dynamic = "force-dynamic";

export default async function Home() {

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">DataOps</span>
            </div>
            <div className="flex items-center gap-4">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <Link
                  href="/auth/sign-in"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
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
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Multi-Agent DataOps
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered data pipeline automation
          </p>
        </div>
      </main>
    </div>
  );
}