import { Card, AnimatedContainer } from "@/lib/components/ui";
import { SignInForm } from "./components";

export const metadata = {
  title: "Sign In - Multi-Agent DataOps",
  description: "Sign in to your account",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <AnimatedContainer className="w-full max-w-md">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to continue</p>
          </div>

          <SignInForm />

          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Don&apos;t have an account?{" "}
              <a
                href="/auth/sign-up"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign up
              </a>
            </p>
          </div>
        </Card>
      </AnimatedContainer>
    </div>
  );
}