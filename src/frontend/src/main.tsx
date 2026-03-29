import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 2 minutes — no unnecessary refetch
      staleTime: 2 * 60 * 1000,
      // Only retry once on failure (ICP cold start handled per-query)
      retry: 1,
      retryDelay: 5000,
      // Don't refetch when user switches back to app tab
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect (avoids thundering herd)
      refetchOnReconnect: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
      <Toaster position="top-center" richColors closeButton />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
