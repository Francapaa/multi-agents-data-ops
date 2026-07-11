"use client";

import dynamic from "next/dynamic";

const AuthControls = dynamic(
  () => import("@/app/components/AuthControls").then((m) => m.AuthControls),
  { ssr: false }
);

const ThemeToggle = dynamic(
  () => import("@/lib/components/ui/DarkModeButton"),
  { ssr: false }
);

export function HeaderControls() {
  return (
    <>
      <ThemeToggle />
      <AuthControls />
    </>
  );
}
