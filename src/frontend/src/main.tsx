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
      staleTime: 2 * 60 * 1000, // 2 minutes cache
      retry: 1, // only retry once on failure
      retryDelay: 2000, // wait 2s before retry
      refetchOnWindowFocus: false, // don't refetch on tab switch
      refetchOnReconnect: false, // don't refetch on reconnect
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
      <Toaster
        position="top-center"
        richColors
        duration={3000}
        toastOptions={{
          style: {
            background: "oklch(0.18 0.05 155)",
            border: "1px solid oklch(0.28 0.05 155)",
            color: "oklch(0.95 0.02 145)",
          },
        }}
      />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
