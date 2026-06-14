
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from "next-themes";
import { NotificationWatcher } from '@/components/notifications/NotificationWatcher';

export const metadata: Metadata = {
  title: 'Kargloss Autocare Purwokerto',
  description: 'Pusat perawatan mobil premium di Purwokerto Utara. Auto Detailing, Salon Mobil, Cuci Mobil, dan Nano Ceramic Protection.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kargloss',
  },
  icons: {
    icon: [
      { url: 'https://i.imgur.com/uU7xwVk.jpeg', sizes: '48x48', type: 'image/jpeg' },
      { url: 'https://i.imgur.com/uU7xwVk.jpeg', sizes: '96x96', type: 'image/jpeg' },
      { url: 'https://i.imgur.com/uU7xwVk.jpeg', sizes: '192x192', type: 'image/jpeg' },
    ],
    apple: [
      { url: 'https://i.imgur.com/uU7xwVk.jpeg', sizes: '180x180', type: 'image/jpeg' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" href="https://i.imgur.com/uU7xwVk.jpeg" />
        {/* Atribut crossOrigin wajib untuk menghindari CORS blocked policy pada manifest di Cloud Workstation */}
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
      </head>
      <body className="font-body antialiased overflow-x-hidden w-full">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <FirebaseClientProvider>
            <NotificationWatcher />
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
