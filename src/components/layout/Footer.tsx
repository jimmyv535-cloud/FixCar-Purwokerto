
'use client';

import React from 'react';
import { MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-white py-12 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <h3 className="font-headline font-bold text-2xl mb-6 tracking-tighter text-secondary">KARGLOSS</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Pusat perawatan mobil premium di Purwokerto Utara. Menggunakan teknologi terkini dan bahan terbaik untuk perlindungan maksimal kendaraan Anda.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Navigasi</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="/#layanan" className="hover:text-secondary transition-colors font-bold uppercase text-[10px] tracking-widest">Layanan</a></li>
              <li><a href="/#lokasi" className="hover:text-secondary transition-colors font-bold uppercase text-[10px] tracking-widest">Lokasi</a></li>
              <li><a href="/member/dashboard" className="hover:text-secondary transition-colors font-bold uppercase text-[10px] tracking-widest">Dashboard Member</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Lokasi</h4>
            <div className="space-y-4 text-gray-400 text-sm">
              <p className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>Jl. Raya Baturraden KM 5, Pabuaran, Purwokerto Utara</span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                <span>+62 811-2612-237</span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} Kargloss Autocare Purwokerto. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
