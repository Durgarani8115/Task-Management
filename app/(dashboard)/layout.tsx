import { AppSidebar } from "@/components/app-sidebar";
import TopHeader from "@/components/header/top-header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <main className="flex-1 min-h-screen">
          <SidebarTrigger />
          <TopHeader />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
