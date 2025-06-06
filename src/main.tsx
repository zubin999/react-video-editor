import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "non.geist";
import "./index.css";
import App from "./app";
import { Toaster } from "@/components/ui/toaster";


const router = createHashRouter(
  [
    {
      path: "/",
      element: <App />,
    },
  ],
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
);