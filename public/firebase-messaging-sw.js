// import firebase scripts inside service worker context
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// initialize firebase inside service worker
firebase.initializeApp({
apiKey: "AIzaSyBVp1vWj1Jn1bklw_B5JDNdxoBg7V2IamI",
  authDomain: "project-management-saas-1d4f0.firebaseapp.com",
  projectId: "project-management-saas-1d4f0",
  storageBucket: "project-management-saas-1d4f0.firebasestorage.app",
  messagingSenderId: "863542499290",
  appId: "1:863542499290:web:914f628bc0fd2e63ad52e3",
  measurementId: "G-0KZ2GDF9L3"
});

const messaging = firebase.messaging();

// handle background messages received when tab is closed or inactive
messaging.onBackgroundMessage((payload) => {
  // extract notification title and body
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update in your workspace.',
    icon: '/favicon.ico',
    data: {
      url: payload.data?.url || '/dashboard'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// handle user click on background notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // focus active tab if available
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // open new tab if no matching window is open
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
