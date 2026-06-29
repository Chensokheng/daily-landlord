import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/app/globals.css";
import { router } from "./router";

const el = document.getElementById("root");
if (el) {
  createRoot(el).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
