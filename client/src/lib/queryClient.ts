import { QueryClient, QueryFunction } from "@tanstack/react-query";

// When running as a bundled Tauri app (Android/Desktop), the WebView loads from
// https://tauri.localhost/ so relative /api/... paths won't reach the server.
// We check lazily (at call time, not module load) in case Tauri injects its
// globals slightly after module evaluation.
function resolveUrl(url: string): string {
  if (url.startsWith("http")) return url;
  const isTauri =
    typeof window !== "undefined" &&
    ((window as any).__TAURI_INTERNALS__ ||
      (window as any).__TAURI__ ||
      window.location.hostname === "tauri.localhost" ||
      window.location.protocol === "tauri:");
  return isTauri ? "https://stormsoftware.co.za" + url : url;
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
  const res = await fetch(resolveUrl(url), {
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
    const res = await fetch(resolveUrl(queryKey[0] as string), {
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
