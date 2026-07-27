import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// firebase web app configuration object from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyBVp1vWj1Jn1bklw_B5JDNdxoBg7V2IamI",
  authDomain: "project-management-saas-1d4f0.firebaseapp.com",
  projectId: "project-management-saas-1d4f0",
  storageBucket: "project-management-saas-1d4f0.firebasestorage.app",
  messagingSenderId: "863542499290",
  appId: "1:863542499290:web:914f628bc0fd2e63ad52e3",
  measurementId: "G-0KZ2GDF9L3"
};

// initialize firebase app instance (prevents duplicate initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// request notification permission and retrieve fcm token
export async function requestFcmToken() {
  try {
    // check if browser supports web push notifications
    const supported = await isSupported();
    if (!supported) return null;

    // prompt user for browser notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      // user blocked or dismissed notification prompt
      return null;
    }

    // register background service worker
    const serviceWorkerRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const messaging = getMessaging(app);
    // request unique device token using vapid public key
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration,
    });

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
