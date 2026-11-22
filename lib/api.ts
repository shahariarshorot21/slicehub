const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/** Fired after a successful mutation so open dashboards can refresh their data. */
export const DATA_CHANGED_EVENT = "slicehub:data-changed";

export function notifyDataChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const payload = text ? safeParse(text) : null;

  if (!response.ok) {
    throw new ApiError(payload?.message || `Request failed (${response.status})`, response.status);
  }

  const method = (options.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") notifyDataChanged();

  return payload as T;
}

function safeParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export const endpoints = {
  menu: "/menu-items",
  orders: "/orders",
  admin: "/admin",
  payments: "/payments",
  me: "/me",
};
