import { CircleHelp, Search, Bell } from "lucide-react";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import DashboardSelector from "@/components/dashboard/dashboard-selector";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./theme-toggle";

export default async function TopHeader() {
  const user = await getServerSession();

  let workspaces: any[] = [];
  if (user) {
    const userMemberships = await db.workspaceMember.findMany({
      where: { userId: user.id },
      include: {
        workspace: {
          include: {
            projects: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    workspaces = userMemberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      projects: m.workspace.projects.map((p) => ({
        id: p.id,
        name: p.name,
      })),
    }));
  }

  return (
    <header className="bg-white dark:bg-zinc-950 h-14 border-b border-slate-200 dark:border-zinc-800 px-6 flex items-center justify-between shrink-0">
      {/* left side: sidebar trigger, workspace and project selectors */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-slate-500 hover:text-slate-900" />
        
        {workspaces.length > 0 && (
          <DashboardSelector workspaces={workspaces} />
        )}
      </div>

      {/* right side: search and action buttons */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-xs sm:max-w-sm hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />

          <input
            type="search"
            aria-label="Search tasks"
            placeholder="Search"
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md py-1.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white dark:focus:bg-zinc-950"
          />
        </div>

        <ThemeToggle />

        <button
          type="button"
          aria-label="Help"
          className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md grid h-8 w-8 place-items-center transition-colors"
        >
          <CircleHelp size={18} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md grid h-8 w-8 place-items-center transition-colors"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}