
"use client";

import React, { useMemo } from "react";
import { MapPin, Phone, Clock, Instagram, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function Contact() {
  const db = useFirestore();
  
  // Fetch dynamic workshop info from Firestore
  const workshopRef = useMemoFirebase(() => doc(db, "siteSettings", "workshop"), [db]);
  const { data: workshop, isLoading } = useDoc(workshopRef);

  const info = useMemo(() => {
    return {
      address: workshop?.address || "Jl. Raya Baturraden KM 5 Pabuaran, Purwokerto Utara, Kabupaten Banyumas, Jawa Tengah",
      hours: workshop?.operationHours || "Senin - Minggu: 08:00 - 17:00 WIB",
      phone: workshop?.phone || "+62 811-2612-237",
      instagramHandle: workshop?.instagramHandle || "@karglossautocare.purwokerto",
      instagramLink: workshop?.instagramLink || "https://www.instagram.com/karglossautocare.purwokerto/",
      mapsUrl: workshop?.mapsUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.7060027855587!2d109.2431763!3d-7.386805699999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e655f05936ebee3%3A0xd66f491f3cea090a!2sCuci%20Mobil%20%7C%20Salon%20Mobil%20%7C%20Cafe%20%26%20Resto%20%7C%20SPKLU%20-%20Kargloss%20Autocare%20%26%20Cafe%20Purwokerto!5e0!3m2!1sid!2sid!4v1774438938288!5m2!1sid!2sid"
    };
  }, [workshop]);

  return (
    <section id="lokasi" className="py-24 bg-muted/30 relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 z-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        </div>
      )}
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary">Kunjungi Workshop Kami</h2>
              <p className="text-muted-foreground text-lg">
                Temukan kami di lokasi strategis Pabuaran, Purwokerto Utara. Kami siap melayani kebutuhan perawatan mobil Anda.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Alamat Lengkap</h3>
                  <p className="text-muted-foreground">{info.address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Jam Operasional</h3>
                  <p className="text-muted-foreground">{info.hours}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Hubungi Kami</h3>
                  <p className="text-muted-foreground">{info.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full shrink-0">
                  <Instagram className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Follow Instagram</h3>
                  <a 
                    href={info.instagramLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-secondary transition-colors font-bold flex items-center gap-2"
                  >
                    {info.instagramHandle}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="bg-primary px-8 rounded-xl h-14">
                <a href={`https://wa.me/${info.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                  Chat via WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary px-8 rounded-xl h-14">
                <a href={info.instagramLink} target="_blank" rel="noopener noreferrer">
                  <Instagram className="mr-2 h-5 w-5" /> Instagram
                </a>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] lg:h-full min-h-[400px] relative border-4 border-white">
            <iframe 
              src={info.mapsUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
