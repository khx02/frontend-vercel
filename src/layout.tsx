import { Outlet } from "react-router";
import { AppSidebar } from "./components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";

export function Layout() {
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
