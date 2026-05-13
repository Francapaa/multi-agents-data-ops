import { Card, AnimatedContainer } from "@/lib/components/ui";
import { SignUpForm } from "./components";

export const metadata = {
  title: "Sign Up - Multi-Agent DataOps",
  description: "Create your account",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100 p-4">
      <AnimatedContainer className="w-full max-w-md">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-2">Start your journey with us</p>
          </div>

          <SignUpForm />

          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Already have an account?{" "}
              <a
                href="/auth/sign-in"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </Card>
      </AnimatedContainer>
    </div>
  );
}