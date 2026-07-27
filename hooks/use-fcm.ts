"use client";

import { useEffect } from "react";
import { requestFcmToken, listenForegroundMessages } from "@/lib/firebase";

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
    listenForegroundMessages((payload) => {
      // log foreground notification payload
      console.log("received foreground push notification:", payload);
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
