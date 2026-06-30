"use client";

import React, { useState, useTransition } from "react";
import { Users, X, Trash2, Loader2 } from "lucide-react";
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
  members: Member[];
  roles: Role[];
  currentUserId: string;
};

export function ManageMembersModal({ workspaceId, members, roles, currentUserId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="minimal-btn-secondary p-2 flex items-center gap-2 text-sm"
      >
        <Users className="w-4 h-4" />
        Manage Members
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="minimal-card p-6 w-[600px] max-w-full relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Modal header */}
            <button
              onClick={() => {
                setIsOpen(false);
                setInviteError(null);
              }}
              className="absolute top-4 right-4 text-slate-400 dark:text-zinc-500 hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Manage Workspace Members
            </h3>

            {/* Invite Form */}
            <div className="border border-border rounded-lg p-4 bg-slate-50/50 dark:bg-zinc-900/20 mb-6">
              <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Invite New Team Member
              </h4>
              <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter email address..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="minimal-panel px-4 py-2 outline-none focus:ring-2 focus:ring-slate-900 flex-1 text-sm bg-white dark:bg-zinc-950"
                  required
                />
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="minimal-panel px-3 py-2 outline-none text-sm bg-white dark:bg-zinc-950 border border-border cursor-pointer sm:w-40"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isPending}
                  className="minimal-btn-primary px-5 py-2 text-sm flex items-center justify-center gap-1.5"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Add Member"
                  )}
                </button>
              </form>
              {inviteError && (
                <p className="text-xs font-semibold text-red-500 mt-2 ml-1">{inviteError}</p>
              )}
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
              <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Current Members ({members.length})
              </h4>
              <div className="flex flex-col gap-2">
                {members.map((member) => {
                  const isSelf = member.user.id === currentUserId;

                  return (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-border/60 bg-white dark:bg-zinc-900/40 rounded-lg gap-3"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-xs shrink-0">
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
                          className="minimal-panel px-2.5 py-1 text-xs bg-slate-50 dark:bg-zinc-950 border border-border cursor-pointer outline-none font-medium text-slate-700 dark:text-zinc-300 disabled:opacity-60 disabled:cursor-not-allowed"
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
                            className="p-1.5 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
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

            {/* Modal footer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-sidebar-border">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setInviteError(null);
                }}
                className="minimal-btn-secondary px-5 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
