import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in/sign-in-form";
import { LoadingState } from "@/components/ui/states";

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading sign in..." />}>
      <SignInForm />
    </Suspense>
  );
}
