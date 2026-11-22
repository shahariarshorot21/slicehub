import type { ReactNode } from "react";

export function FieldError({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null;

  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
      {children}
    </p>
  );
}
