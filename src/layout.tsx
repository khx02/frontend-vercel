import { Outlet } from "react-router";
import { AppSidebar } from "./components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { useTokenRefresh } from "./hooks/useTokenRefresh";

export function Layout() {
  // Initialize token refresh with your preferred options
  useTokenRefresh();

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
