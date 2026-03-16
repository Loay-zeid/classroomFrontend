"use client";

import { Header } from "@/components/refine-ui/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";

/**
 * App layout wrapper that provides sidebar state and renders the global chrome and main content area.
 *
 * Renders a SidebarProvider, the Sidebar, a Header, and a main content region that contains `children`.
 *
 * @param children - The React nodes to render inside the layout's main content area
 * @returns A React element representing the application layout with sidebar and header
 */
export function Layout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Header />
        <main
          className={cn(
            "@container/main",
            "container",
            "mx-auto",
            "relative",
            "w-full",
            "flex",
            "flex-col",
            "flex-1",
            "px-2",
            "pt-4",
            "md:p-4",
            "lg:px-6",
            "lg:pt-6"
          )}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

Layout.displayName = "Layout";
