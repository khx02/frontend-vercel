import { Outlet } from "react-router";
import { AppSidebar } from "./components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { useTokenRefresh } from "./hooks/useTokenRefresh";

export function Layout() {
  // Prevent these paths from doing the refresh logic
  useTokenRefresh({
    excludeRoutes: ["/login", "/signup", "/"],
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="m-4 w-full">
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
