"use client";

import { useEffect } from "react";
import { requestFcmToken, listenForegroundMessages } from "@/lib/firebase";
import { toast } from "sonner";

// react hook for fcm push notification registration and foreground listener
export function useFcm() {
  useEffect(() => {
    // initialize fcm token registration
    async function initFcm() {
      const token = await requestFcmToken();
      if (token) {
        // save device token to server
        try {
          await fetch("/api/user/fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        } catch (error) {
          // log error if saving token fails
          console.error("failed to sync fcm token to server:", error);
        }
      }
    }

    initFcm();

    // listen for incoming foreground push notifications
    let unsubscribe: (() => void) | undefined;
    listenForegroundMessages((payload: any) => {
      // log foreground notification payload
      console.log("received foreground push notification:", payload);
      
      const title = payload.notification?.title || "New Notification";
      const body = payload.notification?.body;
      
      toast(title, {
        description: body,
      });

      // dispatch custom event to notify components like notification-bell to refetch
      window.dispatchEvent(new Event("fcm-message"));
    }).then((unsub) => {
      if (typeof unsub === "function") {
        unsubscribe = unsub;
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);
}
