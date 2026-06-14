
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { InstagramSection } from "@/components/sections/InstagramSection";
import { YoutubeSection } from "@/components/sections/YoutubeSection";
import { BookingSection } from "@/components/sections/BookingSection";
import { Contact } from "@/components/sections/Contact";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      
      <Services />
      <InstagramSection />
      <YoutubeSection />
      <BookingSection />
      
      <Contact />
      
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
                <li><a href="#layanan" className="hover:text-secondary transition-colors">Layanan</a></li>
                <li><a href="#lokasi" className="hover:text-secondary transition-colors">Lokasi</a></li>
                <li><a href="/member" className="hover:text-secondary transition-colors">Cek Antrian</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Lokasi</h4>
              <p className="text-gray-400 text-sm">
                Jl. Raya Baturraden KM 5<br />
                Pabuaran, Purwokerto Utara<br />
                Kab. Banyumas, Jawa Tengah
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-xs">
            © {new Date().getFullYear()} Kargloss Autocare Purwokerto. All Rights Reserved.
          </div>
        </div>
      </footer>
      
      <FloatingWhatsApp />
    </main>
  );
}
