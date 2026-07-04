import db from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import Link from 'next/link';
import { CreateWorkspaceForm } from '@/components/workspace/create-workspace-form';

export default async function WorkspacePage() {
  // get the current logged-in user using the new server component helper
  const user = await getServerSession();

  // fetch all workspaces this user is a member of
  let workspaces: any[] = [];
  if (user) {
    const userMemberships = await db.workspaceMember.findMany({
      where: { userId: user.id },
      include: {
        roleRef: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        },
        workspace: true
      }
    });

    for (const m of userMemberships) {
      const hasManagePermission = m.roleRef?.permissions.some(
        (rp) => rp.permission.name === "canManageProject"
      ) || false;

      if (hasManagePermission) {
        // managers/admins see all workspaces they belong to
        workspaces.push(m.workspace);
      } else {
        // teammates only see workspaces where they have tasks assigned in at least one project
        const assignedTask = await db.task.findFirst({
          where: {
            project: {
              workspaceId: m.workspaceId
            },
            assignees: {
              some: {
                userId: user.id
              }
            }
          }
        });

        if (assignedTask) {
          workspaces.push(m.workspace);
        }
      }
    }
  }

  return (
    <div className='w-full px-4 py-6 sm:p-6 max-w-6xl mx-auto'>
      <h2 className='text-2xl font-semibold mb-6'>my workspaces</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {workspaces.map((ws) => (
          <Link 
            key={ws.id} 
            href={`/workspaces/${ws.id}`}
            className="flex flex-col p-5 border border-border bg-card text-card-foreground rounded-lg hover:border-primary transition-colors min-h-[120px] h-full cursor-pointer"
          >
            <h3 className="font-semibold text-lg text-foreground">{ws.name}</h3>
            {ws.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{ws.description}</p>
            )}
          </Link>
        ))}

        {/* create new workspace tile */}
        <CreateWorkspaceForm />
      </div>
    </div>
  )
}