import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import TopHeader from "@/components/header/top-header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // redirect to sign-in if user session is not found
  const user = await getServerSession();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
          <TopHeader />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

