"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If inital loading has ended and the user is not authenticated
    if (!isLoading && !isAuthenticated) {
      // ...redireciona para o login.
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading screen while checking authentication.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If the user is authenticated, renders page contents
  // Returns null if the user is not authenticated to avoid quick flashes
  return isAuthenticated ? (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  ) : null;
}
