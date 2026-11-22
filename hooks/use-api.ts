"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, DATA_CHANGED_EVENT } from "@/lib/api";

export function useApi<T>(path: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<string | null>(null);
  // A stable serialization keeps the hook dependency list static while still
  // refetching when callers pass changing values such as search filters.
  const depsKey = JSON.stringify(deps);

  const load = useCallback(
    async (quiet = false) => {
      void depsKey; // Keep serialized filters in the dependency graph.
      if (!path) return;
      if (!quiet) setLoading(true);
      setError(null);
      try {
        setData(await apiFetch<T>(path));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [path, depsKey]
  );

  const reload = useCallback(() => load(false), [load]);

  useEffect(() => {
    // Defer to a microtask so loading/result state updates never happen
    // synchronously during the effect itself.
    void Promise.resolve().then(reload);
  }, [reload]);

  useEffect(() => {
    if (!path) return;
    // Keep live pages in sync with orders placed or status-updated elsewhere,
    // plus when the customer/vendor returns to this browser tab.
    const refresh = () => void load(true);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener(DATA_CHANGED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener(DATA_CHANGED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [path, load]);

  return { data, loading, error, reload, setData };
}
