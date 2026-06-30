import prisma from "../lib/db";

async function main() {
  console.log("starting rbac seeding...");

  // 1. create permissions
  const permissionsData = [
    { name: "canManageWorkspace", description: "allows editing workspace settings and deleting workspace" },
    { name: "canManageProject", description: "allows creating, editing, and deleting projects inside the workspace" },
    { name: "canAssignTask", description: "allows assigning or unassigning tasks to workspace members" },
    { name: "canCreateTask", description: "allows creating tasks inside workspace projects" },
    { name: "canEditTask", description: "allows editing and changing status of tasks inside workspace projects" },
  ];

  const permissions: Record<string, any> = {};
  for (const perm of permissionsData) {
    permissions[perm.name] = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }
  console.log("permissions seeded successfully.");

  // 2. create roles
  const rolesData = [
    { name: "Admin", description: "full workspace administrator access" },
    { name: "Manager", description: "manage projects and assign tasks" },
    { name: "Assistant", description: "view and edit task details and columns" },
  ];

  const roles: Record<string, any> = {};
  for (const role of rolesData) {
    roles[role.name] = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log("roles seeded successfully.");

  // 3. link permissions to roles
  const rolePermissionsMap: Record<string, string[]> = {
    Admin: ["canManageWorkspace", "canManageProject", "canAssignTask", "canCreateTask", "canEditTask"],
    Manager: ["canManageProject", "canAssignTask", "canCreateTask", "canEditTask"],
    Assistant: ["canCreateTask", "canEditTask"],
  };

  for (const [roleName, permNames] of Object.entries(rolePermissionsMap)) {
    const roleId = roles[roleName].id;
    for (const permName of permNames) {
      const permId = permissions[permName].id;
      
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId: permId,
        },
      });
    }
  }
  console.log("role-permissions mappings seeded successfully.");

  // 4. backfill existing members to their respective roles
  console.log("migrating existing workspace members to db-level roles...");
  const members = await prisma.workspaceMember.findMany();
  for (const member of members) {
    let targetRoleName = "Admin";
    if (member.role === "MEMBER") {
      targetRoleName = "Manager";
    } else if (member.role === "VIEWER") {
      targetRoleName = "Assistant";
    }

    const roleId = roles[targetRoleName].id;

    await prisma.workspaceMember.update({
      where: { id: member.id },
      data: { roleId },
    });
  }
  console.log("workspace members migrated successfully.");
  console.log("rbac seeding complete!");
}

main()
  .catch((e) => {
    console.error("error seeding rbac database:", e);
    process.exit(1);
  });
