
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Konfigurasi Firebase Kargloss (Menggunakan SDK Compat untuk stabilitas background)
firebase.initializeApp({
  apiKey: "AIzaSyDrofjDpUuE8cbR_KXRcvTmu_nCj2e4AbA",
  authDomain: "kargloss-autocare.firebaseapp.com",
  projectId: "kargloss-autocare",
  storageBucket: "kargloss-autocare.firebasestorage.app",
  messagingSenderId: "501671971085",
  appId: "1:501671971085:web:60d1d52075d8f9c46a0844"
});

const messaging = firebase.messaging();

// Menangani notifikasi saat browser di latar belakang (Smartphone terkunci/browser ditutup)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Pesan latar belakang diterima: ', payload);
  
  const notificationTitle = payload.notification?.title || 'Kargloss Autocare';
  const notificationOptions = {
    body: payload.notification?.body || 'Cek penawaran terbaru kami hari ini!',
    icon: payload.notification?.icon || 'https://i.imgur.com/uU7xwVk.jpeg',
    badge: 'https://i.imgur.com/uU7xwVk.jpeg',
    tag: payload.notification?.tag || 'kargloss-push',
    renotify: true,
    requireInteraction: true, // Memaksa muncul sebagai Pop-up Banner di smartphone (Logika Ambara)
    vibrate: [200, 100, 200, 100, 200], // Pola getaran kuat
    data: payload.data || { link: '/member/dashboard' }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Menangani klik pada notifikasi
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/member/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(link) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(link);
      }
    })
  );
});

// Handler Fetch untuk memastikan PWA dianggap "Installable" oleh browser
self.addEventListener('fetch', (event) => {
  // Biarkan browser menangani request secara normal
  return;
});
