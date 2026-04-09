import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ComponentProvider } from "@/components/ui/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <ComponentProvider>
      <App />
    </ComponentProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
