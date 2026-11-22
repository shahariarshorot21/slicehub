import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AUTH_URL = (process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:4000").replace(/\/$/, "");


async function proxy(request: Request) {
  const incoming = new URL(request.url);
  const path = incoming.pathname.replace(/^\/api\/auth/, "") || "/";
  const target = `${AUTH_URL}/api/auth${path}${incoming.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const hasBody = !["GET", "HEAD"].includes(request.method.toUpperCase());
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return NextResponse.json({ message: "Authentication service is unavailable" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
