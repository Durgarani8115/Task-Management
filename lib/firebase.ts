import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// firebase web app configuration object from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// initialize firebase app instance (prevents duplicate initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// request notification permission and retrieve fcm token
export async function requestFcmToken() {
  try {
    // check if browser supports web push notifications
    const supported = await isSupported();
    if (!supported) {
      console.warn("browser does not support web push notifications");
      return null;
    }

    // prompt user for browser notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      // user blocked or dismissed notification prompt
      console.warn("browser notification permission was not granted:", permission);
      return null;
    }

    // register background service worker
    const firebaseConfigStr = encodeURIComponent(JSON.stringify(firebaseConfig));
    const serviceWorkerRegistration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?firebaseConfig=${firebaseConfigStr}`
    );

    const messaging = getMessaging(app);

    // construct token options conditionally
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const tokenOptions: { serviceWorkerRegistration: ServiceWorkerRegistration; vapidKey?: string } = {
      serviceWorkerRegistration,
    };
    if (vapidKey) {
      tokenOptions.vapidKey = vapidKey;
    }

    // request unique device token
    const currentToken = await getToken(messaging, tokenOptions);
    if (currentToken) {
      console.log("fcm push token retrieved successfully:", currentToken);
    }
    return currentToken;
  } catch (error) {
    // log error if token retrieval fails
    console.error("failed to get fcm token:", error);
    return null;
  }
}

// listen for push notifications received while the website is active
export async function listenForegroundMessages(callback: (payload: unknown) => void) {
  const supported = await isSupported();
  if (!supported) return;

  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => {
    // send payload to ui for toast display
    callback(payload);
  });
}
