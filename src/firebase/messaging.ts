
'use client';

import { getMessaging, getToken } from "firebase/messaging";
import { initializeFirebase } from "./index";
import { doc, setDoc } from "firebase/firestore";

/**
 * @fileOverview Fungsi pembantu untuk Firebase Cloud Messaging (FCM).
 */

const VAPID_KEY = "BNYJYuLQpvT2G26y6cTfn2unklsFffIH6z_AGeUOb5WcRTaT7oxoU1f5UjNg-rxS6O1jiugsPNQlrbmxTBcHyvE";

export async function requestAndStoreFCMToken(uid: string): Promise<string | null> {
  try {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("Service Worker tidak didukung di browser ini.");
      return null;
    }

    // 1. Minta izin notifikasi
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Izin notifikasi ditolak oleh pengguna.");
    }

    // 2. Inisialisasi Firebase Messaging
    const { firebaseApp, firestore } = initializeFirebase();
    const messaging = getMessaging(firebaseApp);

    // 3. Daftarkan Service Worker dan tunggu sampai 'ready'
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    // 4. Ambil Token FCM
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      // 5. Simpan token ke Firestore menggunakan setDoc merge agar aman bagi Admin/Owner
      const memberRef = doc(firestore, "members", uid);
      await setDoc(memberRef, {
        fcmToken: token,
        lastTokenUpdate: new Date().toISOString()
      }, { merge: true });
      
      console.log("FCM Token berhasil didaftarkan:", token);
      return token;
    } else {
      console.warn("Tidak ada token pendaftaran yang tersedia.");
      return null;
    }
  } catch (error: any) {
    console.error("Gagal mendapatkan Token FCM:", error);
    throw error;
  }
}
