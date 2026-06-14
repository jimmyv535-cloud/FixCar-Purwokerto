
'use client';

import { useEffect, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';

/**
 * @fileOverview Komponen "Intelijen" yang memantau Firestore secara real-time.
 * Menggunakan parameter notifikasi standar Ambara (unread status) untuk memicu pop-up.
 */
export function NotificationWatcher() {
  const { user } = useUser();
  const db = useFirestore();
  const lastProcessedId = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !db) return;

    // Memantau notifikasi terbaru yang berstatus 'unread' (Logika Ambara)
    const q = query(
      collection(db, "members", user.uid, "notifications"),
      where("status", "==", "unread"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) return;

      const newestDoc = snapshot.docs[0];
      const data = newestDoc.data();
      const docId = newestDoc.id;

      if (lastProcessedId.current === docId) return;
      
      // Jangan trigger notifikasi yang sudah lama (lebih dari 5 menit)
      const createdAt = new Date(data.createdAt).getTime();
      const now = new Date().getTime();
      if (now - createdAt > 300000) {
        lastProcessedId.current = docId;
        return;
      }

      lastProcessedId.current = docId;

      // TRIGGER POP-UP NOTIFIKASI VIA SERVICE WORKER
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && "showNotification" in registration) {
            await registration.showNotification(data.title || "Kargloss Promo", {
              body: data.body || "Cek penawaran terbaru kami.",
              icon: "https://i.imgur.com/uU7xwVk.jpeg",
              badge: "https://i.imgur.com/uU7xwVk.jpeg",
              image: data.imageUrl || undefined,
              vibrate: [200, 100, 200, 100, 200], // Standar getaran Ambara
              tag: "kargloss-push",
              renotify: true,
              requireInteraction: true, // Banner tidak akan hilang sampai diklik
              data: {
                link: data.link || "/member/dashboard"
              }
            });
          }
        } catch (err) {
          console.error("Watcher gagal memicu notifikasi:", err);
        }
      }
    });

    return () => unsubscribe();
  }, [user, db]);

  return null;
}
