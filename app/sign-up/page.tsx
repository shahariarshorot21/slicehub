import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/sign-up/sign-up-form";
import { LoadingState } from "@/components/ui/states";

export default function SignUpPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading sign up..." />}>
      <SignUpForm />
    </Suspense>
  );
}
