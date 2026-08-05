// import firebase scripts inside service worker context
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// extract config from URL query parameters
const urlParams = new URLSearchParams(location.search);
const firebaseConfigStr = urlParams.get('firebaseConfig');

if (firebaseConfigStr) {
  try {
    const firebaseConfig = JSON.parse(decodeURIComponent(firebaseConfigStr));
    firebase.initializeApp(firebaseConfig);
  } catch (e) {
    console.error('Failed to parse Firebase config', e);
  }
} else {
  console.error('Firebase config not found in service worker URL.');
}

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
