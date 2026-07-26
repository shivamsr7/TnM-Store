import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
 AuthProvider
} from "@/features/Auth/context/AuthContext";
import "./index.css";

import App from "./App";

import QueryProvider from "@/app/providers/QueryProvider";

import {
  AuthDialogProvider,
} from "@/features/Auth/context/AuthDialogContext";
import { Toaster } from "sonner";


createRoot(
  document.getElementById("root")!
).render(

  <StrictMode>

    <QueryProvider>

      <BrowserRouter>

       <AuthProvider>

<AuthDialogProvider>

<App />
<Toaster
            position="top-right"
            richColors
          />
</AuthDialogProvider>

</AuthProvider>

      </BrowserRouter>

    </QueryProvider>

  </StrictMode>

);

