import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { proxy } from "./proxy";

function makeRequest(path: string, cookieHeader?: string) {
  return new NextRequest(new URL(path, "http://localhost:3000"), {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}

describe("proxy", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("redirects unauthenticated user from /dashboard to /login", async () => {
    const response = await proxy(makeRequest("/dashboard"));

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
  });

  it("redirects unauthenticated user from /dashboard/settings to /login", async () => {
    const response = await proxy(makeRequest("/dashboard/settings"));

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
  });

  it("allows authenticated user to access /dashboard with the standard session cookie", async () => {
    const response = await proxy(makeRequest("/dashboard", "better-auth.session_token=abc"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("allows authenticated user to access /dashboard with the secure-prefixed session cookie", async () => {
    const response = await proxy(
      makeRequest("/dashboard", "__Secure-better-auth.session_token=abc"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
