import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

import App from "./App";

import QueryProvider from "@/app/providers/QueryProvider";

import {
  AuthDialogProvider,
} from "@/features/Auth/context/AuthDialogContext";



createRoot(
  document.getElementById("root")!
).render(

  <StrictMode>

    <QueryProvider>

      <BrowserRouter>

        <AuthDialogProvider>

          <App />

        </AuthDialogProvider>

      </BrowserRouter>

    </QueryProvider>

  </StrictMode>

);