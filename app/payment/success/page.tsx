import { Suspense } from "react";
import { PaymentSuccess } from "@/components/payment/payment-success";
import { LoadingState } from "@/components/ui/states";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading payment details..." />}>
      <PaymentSuccess />
    </Suspense>
  );
}
