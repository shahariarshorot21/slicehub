import { Suspense } from "react";
import { BrowseMenu } from "@/components/menu/browse-menu";
import { LoadingState } from "@/components/ui/states";

export default function MenuPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading menu..." />}>
      <BrowseMenu />
    </Suspense>
  );
}
