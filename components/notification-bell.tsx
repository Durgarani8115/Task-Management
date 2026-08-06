"use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  actor?: {
    name: string;
    image?: string | null;
  } | null;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // fetch notifications from server
  const fetchNotifications = async () => {
    console.log("[debug][notification-bell] starting fetchNotifications");
    try {
      const res = await fetch("/api/notifications", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      console.log("[debug][notification-bell] fetch response:", res.status, res.statusText);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.warn("[debug][notification-bell] response not ok:", await res.text());
      }
    } catch (error) {
      console.error("[debug][notification-bell] failed to load notifications:", error);
      console.dir(error); // prints the detailed object
    }
  };

  useEffect(() => {
    fetchNotifications();
    // poll for new notifications every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // mark single or all notifications read
  const handleMarkAsRead = async (id?: string) => {
    try {
      if (id) {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationIds: [id] }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAllRead: true }),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("failed to mark notifications read:", error);
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* bell trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* notification dropdown popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border bg-popover text-popover-foreground shadow-lg z-50 overflow-hidden">
          {/* popover header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => handleMarkAsRead()}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                mark all read
              </button>
            )}
          </div>

          {/* notification list */}
          <div className="max-h-80 overflow-y-auto divide-y">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                no notifications yet
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 text-sm hover:bg-muted/50 transition-colors flex items-start justify-between gap-2 ${
                    !item.isRead ? "bg-accent/40 font-medium" : ""
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <p className="font-semibold text-foreground leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.message}</p>
                    <p className="text-[10px] text-muted-foreground/70">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.linkUrl && (
                      <Link
                        href={item.linkUrl}
                        onClick={() => setIsOpen(false)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                        title="mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
