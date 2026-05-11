"use client";

import { useActionState } from "react";
import { signInWithEmail } from "../actions";
import { Input, Button, ErrorMessage } from "@/lib/components/ui";
import Link from "next/link";
import SocialLogin from "./SocialLogin";

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <form action={formAction} className="space-y-5">
      <Input
        label="Email Address"
        name="email"
        type="email"
        required
        placeholder="john@example.com"
      />
      <Input
        label="Password"
        name="password"
        type="password"
        required
        placeholder="123..."
      />

      <div className="flex justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <ErrorMessage message={state?.error || ""} />

      <Button type="submit" isLoading={isPending}>
        Sign In
      </Button>

      <SocialLogin />
    </form>
  );
}