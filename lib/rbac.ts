import prisma from "@/lib/db";

// helper to verify if a user has a specific permission in a workspace
export async function hasPermission(
  userId: string,
  workspaceId: string,
  permissionName: string
): Promise<boolean> {
  const member = await prisma.workspaceMember.findFirst({
    where: { userId, workspaceId },
    include: {
      roleRef: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!member || !member.roleRef) return false;

  // return whether the role carries the specified permission
  return member.roleRef.permissions.some(
    (rp) => rp.permission.name === permissionName
  );
}

// helper to retrieve all permission names for a member in a workspace
export async function getMemberPermissions(
  userId: string,
  workspaceId: string
): Promise<string[]> {
  const member = await prisma.workspaceMember.findFirst({
    where: { userId, workspaceId },
    include: {
      roleRef: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!member || !member.roleRef) return [];

  // map out and return the permission names
  return member.roleRef.permissions.map((rp) => rp.permission.name);
}
