import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ComponentProvider } from "@/components/ui/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ComponentProvider>
        <Toaster />
        <App />
      </ComponentProvider>
    </QueryClientProvider>
  </React.StrictMode>
);