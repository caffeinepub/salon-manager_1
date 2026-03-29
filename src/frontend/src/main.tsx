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

// Permanent fix: patient retry settings for ICP cold start (20-45s warmup time)
// retry: 3 means 3 retries after first failure = 4 total attempts
// retryDelay gives ICP enough time to wake up between attempts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 min cache — reduces unnecessary refetches
      retry: 2, // 2 retries after failure
      retryDelay: (attempt) => Math.min(5000 * (attempt + 1), 20000), // 5s, 10s gaps
      refetchOnWindowFocus: false, // Don't refetch on tab switch
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
        closeButton
        toastOptions={{ duration: 4000 }}
      />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
