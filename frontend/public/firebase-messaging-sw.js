importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB8aaa52bX0xUlFqnNqEPp4xbqnbjy9kE0",
  authDomain: "fermentory-591d2.firebaseapp.com",
  projectId: "fermentory-591d2",
  storageBucket: "fermentory-591d2.firebasestorage.app",
  messagingSenderId: "1052041406304",
  appId: "1:1052041406304:web:614990e454911eb58a6005"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'Culture Club Reminder';
  const notificationOptions = {
    body: payload.notification.body || 'Time to check your fermentation!',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received.');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
