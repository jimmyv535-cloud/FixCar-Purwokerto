import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Mendeteksi tipe media dari URL dan mengonversinya menjadi URL embed jika itu adalah video.
 * Mendukung YouTube (termasuk Shorts) dan TikTok.
 */
export function getEmbedUrl(url: string) {
  if (!url) return { type: 'image', url: '' };

  // Deteksi YouTube (termasuk Shorts, watch, embed, youtu.be)
  const youtubeRegex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const youtubeMatch = url.match(youtubeRegex);
  
  if (youtubeMatch && youtubeMatch[1] && youtubeMatch[1].length === 11) {
    return {
      type: 'video',
      url: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0`
    };
  }

  // Deteksi TikTok
  const tiktokRegex = /tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/)(\d+)/i;
  const tiktokMatch = url.match(tiktokRegex);
  if (tiktokMatch && tiktokMatch[1]) {
    return {
      type: 'video',
      url: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`
    };
  }

  // Deteksi file video langsung (mp4, webm, ogg)
  const isVideoFile = /\.(mp4|webm|ogg)$/i.test(url);
  if (isVideoFile) {
    return { type: 'video', url };
  }

  return { type: 'image', url };
}
