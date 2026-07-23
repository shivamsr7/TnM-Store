import type { ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import { Toaster } from "sonner";

type Props = {
  children: ReactNode;
};

export default function AppProviders({ children }: Props) {
  return (
    <QueryProvider>
      {children}
      <Toaster richColors position="top-right" />
    </QueryProvider>
  );
}