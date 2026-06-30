"use client";

import React, { useState, useTransition } from "react";
import { Users, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  addWorkspaceMemberAction,
  updateWorkspaceMemberRoleAction,
  removeWorkspaceMemberAction,
} from "@/app/actions/workspace-actions";

type Member = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  roleId: string | null;
  roleRef: {
    id: string;
    name: string;
  } | null;
};

type Role = {
  id: string;
  name: string;
};

type Props = {
  workspaceId: string;
  workspaceName: string;
  members: Member[];
  roles: Role[];
  currentUserId: string;
};

export function MembersSettingsForm({ workspaceId, workspaceName, members, roles, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || "");

  const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInviteError(null);

    const formData = new FormData();
    formData.append("workspaceId", workspaceId);
    formData.append("email", inviteEmail);
    formData.append("roleId", selectedRoleId);

    startTransition(async () => {
      try {
        await addWorkspaceMemberAction(formData);
        setInviteEmail("");
      } catch (err: any) {
        setInviteError(err.message || "Failed to add member");
      }
    });
  };

  const handleRoleChange = async (memberId: string, newRoleId: string) => {
    const formData = new FormData();
    formData.append("workspaceId", workspaceId);
    formData.append("memberId", memberId);
    formData.append("roleId", newRoleId);

    startTransition(async () => {
      try {
        await updateWorkspaceMemberRoleAction(formData);
      } catch (err: any) {
        alert(err.message || "Failed to update role");
      }
    });
  };

  const handleRemoveMember = async (memberId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this workspace?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("workspaceId", workspaceId);
    formData.append("memberId", memberId);

    startTransition(async () => {
      try {
        await removeWorkspaceMemberAction(formData);
      } catch (err: any) {
        alert(err.message || "Failed to remove member");
      }
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header back navigation link */}
      <div className="flex items-center gap-3">
        <Link
          href={`/workspaces/${workspaceId}?workspaceId=${workspaceId}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Workspace
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-7 h-7 text-primary" />
            Manage Members
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Manage roles, permissions, and team members inside the <span className="font-semibold text-foreground">{workspaceName}</span> workspace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column: Invite Form */}
        <div className="minimal-card p-6 lg:col-span-1 flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-zinc-100">Invite Team Member</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add new members by typing their registered email address and choosing a system role.
            </p>
          </div>

          <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4 mt-2">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">
                Email Address <span className="text-primary ml-0.5">*</span>
              </label>
              <input
                type="email"
                placeholder="colleague@clove.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="minimal-panel px-4 py-2 outline-none focus:ring-2 focus:ring-slate-900 w-full text-sm bg-white dark:bg-zinc-950 border border-border"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">
                Workspace Role <span className="text-primary ml-0.5">*</span>
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="minimal-panel px-3 py-2 outline-none text-sm bg-white dark:bg-zinc-950 border border-border cursor-pointer w-full"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="minimal-btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-1.5 mt-2"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add to Workspace"
              )}
            </button>
          </form>

          {inviteError && (
            <p className="text-xs font-semibold text-red-500 mt-2 bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg">
              {inviteError}
            </p>
          )}
        </div>

        {/* Right column: Members List */}
        <div className="minimal-card p-6 lg:col-span-2 flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-zinc-100">
              Current Workspace Members ({members.length})
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Active members belonging to this workspace and their respective authorization roles.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {members.map((member) => {
              const isSelf = member.user.id === currentUserId;

              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/60 bg-slate-50/20 dark:bg-zinc-900/10 rounded-lg gap-4"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden text-left">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {member.user.name} {isSelf && <span className="text-xs text-primary font-normal">(you)</span>}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {member.user.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end shrink-0">
                    {/* Role selection dropdown */}
                    <select
                      value={member.roleId || ""}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      disabled={isPending || isSelf}
                      className="minimal-panel px-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-border cursor-pointer outline-none font-medium text-slate-700 dark:text-zinc-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>

                    {/* Remove button */}
                    {!isSelf && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.user.name)}
                        disabled={isPending}
                        aria-label="Remove member"
                        className="p-2 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
