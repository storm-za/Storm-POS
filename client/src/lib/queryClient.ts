import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Detect whether we are running inside the Tauri native shell (Android/Desktop).
// Checked lazily at call time because Tauri may inject its globals slightly after
// module evaluation on some builds.
function isTauriNative(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return !!(
    (window as any).__TAURI_INTERNALS__ ||
    (window as any).__TAURI__ ||
    window.location.protocol === "tauri:" ||
    window.location.protocol === "asset:" ||
    (h.endsWith(".localhost") && h !== "localhost")
  );
}

// In a bundled Tauri app the WebView origin is https://tauri.localhost/ so
// relative /api/... paths must be prefixed with the production domain.
function resolveUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return isTauriNative() ? "https://stormsoftware.co.za" + url : url;
}

// On Android the WebView's native fetch() is subject to full browser CORS.
// @tauri-apps/plugin-http routes requests through Rust's HTTP client which
// bypasses WebView CORS entirely — this is the official Tauri v2 solution.
async function platformFetch(url: string, options?: RequestInit): Promise<Response> {
  const resolved = resolveUrl(url);
  if (isTauriNative()) {
    const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
    return tauriFetch(resolved, options) as Promise<Response>;
  }
  return fetch(resolved, options);
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await platformFetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await platformFetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
