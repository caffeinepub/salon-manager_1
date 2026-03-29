import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";
import { Toaster } from "./components/ui/sonner";

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
      staleTime: 2 * 60 * 1000, // 2 min — cached data shows instantly, no re-fetch
      retry: 1, // only 1 retry on failure (not 3)
      retryDelay: 3000, // 3s between retries
      refetchOnWindowFocus: false, // switching apps won't trigger reload
      refetchOnReconnect: true, // reconnect after internet drop is fine
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
      <Toaster richColors position="top-center" />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
