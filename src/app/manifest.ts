import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kargloss Autocare Purwokerto',
    short_name: 'Kargloss',
    description: 'Pusat perawatan mobil premium di Purwokerto Utara.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    gcm_sender_id: '501671971085', // Syarat mutlak push notifikasi di Android
    icons: [
      {
        src: 'https://i.imgur.com/uU7xwVk.jpeg',
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
      {
        src: 'https://i.imgur.com/uU7xwVk.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any',
      },
    ],
  }
}
