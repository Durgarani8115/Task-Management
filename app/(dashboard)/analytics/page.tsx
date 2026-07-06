import React from "react";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { GlobalAnalytics } from "@/components/analytics/global-analytics";

export default async function AnalyticsPage() {
  const user = await getServerSession();

  if (!user) {
    redirect("/sign-in"); // secure the page
  }

  // fetch all workspaces this user is a member of, along with projects, columns, tasks, and members
  const userMemberships = await db.workspaceMember.findMany({
    where: { userId: user.id },
    include: {
      workspace: {
        include: {
          projects: {
            include: {
              columns: {
                select: {
                  id: true,
                  title: true
                }
              },
              tasks: {
                include: {
                  column: {
                    select: {
                      title: true
                    }
                  },
                  assignees: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                          email: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  // extract workspaces list from memberships
  const workspaces = userMemberships.map((membership) => membership.workspace);

  return <GlobalAnalytics workspaces={workspaces} />;
}
