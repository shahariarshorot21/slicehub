import { Suspense } from "react";
import { MenuModeration } from "@/components/admin/menu-moderation";
import { LoadingState } from "@/components/ui/states";

export default function AdminMenuPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading moderation tools..." />}>
      <MenuModeration />
    </Suspense>
  );
}
