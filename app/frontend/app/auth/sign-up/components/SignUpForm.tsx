"use client";

import { useActionState } from "react";
import { signUpWithEmail } from "../actions";
import { Input, Button, ErrorMessage } from "@/lib/components/ui";
import { PasswordInput } from "@neondatabase/auth/react";

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

  return (
    <form action={formAction} className="space-y-5">
      <Input
        label="Full Name"
        name="name"
        type="text"
        required
        placeholder="John Doe"
      />

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



      <ErrorMessage message={state?.error || ""} />

      <Button type="submit" isLoading={isPending}>
        Create Account
      </Button>
    </form>
  );
}