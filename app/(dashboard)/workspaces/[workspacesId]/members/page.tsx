import React from "react";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMemberPermissions } from "@/lib/rbac";
import { MembersSettingsForm } from "@/components/workspace/members-settings-form";

type Props = {
  params: Promise<{ workspacesId: string }>;
};

export default async function WorkspaceMembersPage({ params }: Props) {
  const user = await getServerSession();
  
  if (!user) {
    redirect("/sign-in");
  }

  const resolvedParams = await params;
  const workspaceId = resolvedParams.workspacesId;

  // fetch the specific workspace
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    return <div>workspace not found</div>;
  }

  // verify permission to manage members
  const permissions = await getMemberPermissions(user.id, workspaceId);
  const canManageWorkspace = permissions.includes("canManageWorkspace");

  if (!canManageWorkspace) {
    return (
      <div className="w-full px-4 py-8 sm:p-8 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm">
          You do not have permission to manage team members in this workspace.
        </p>
      </div>
    );
  }

  // fetch workspace members and all roles
  const workspaceMembers = await db.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      roleRef: {
        select: { id: true, name: true }
      }
    }
  });

  const allRoles = await db.role.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="w-full px-4 py-8 sm:p-8 max-w-6xl mx-auto">
      <MembersSettingsForm
        workspaceId={workspace.id}
        workspaceName={workspace.name}
        members={workspaceMembers}
        roles={allRoles}
        currentUserId={user.id}
      />
    </div>
  );
}
