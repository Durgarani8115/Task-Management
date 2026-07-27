"use client";

import { useFcm } from "@/hooks/use-fcm";

// client component wrapper to initialize fcm push notifications across the app
export function FcmProvider({ children }: { children: React.ReactNode }) {
  // initialize fcm token registration and notification listeners
  useFcm();

  return <>{children}</>;
}
