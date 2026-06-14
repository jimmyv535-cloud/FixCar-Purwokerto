
'use client';

import React, { useMemo } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { Sparkles, Car, ShieldCheck, Droplets, Wrench, Zap, Loader2 } from "lucide-react";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";

const ICON_MAP: Record<string, any> = {
  Sparkles,
  Car,
  ShieldCheck,
  Droplets,
  Wrench,
  Zap
};

export function Services() {
  const db = useFirestore();
  
  // Dynamic Services Master Data
  const servicesQuery = useMemoFirebase(() => query(collection(db, "services"), orderBy("name", "asc")), [db]);
  const { data: remoteServices, isLoading: isSvcLoading } = useCollection(servicesQuery);

  const services = useMemo(() => {
    // If no dynamic services yet, show static fallbacks for a good first impression
    const base = remoteServices && remoteServices.length > 0 ? remoteServices : [
      { id: "detailing", name: "Auto Detailing", description: "Pembersihan mendalam hingga ke pori-pori terkecil.", icon: "Sparkles" },
      { id: "salon", name: "Salon Mobil", description: "Restorasi menyeluruh pada interior dan eksterior.", icon: "Car" },
      { id: "washing", name: "Cuci Mobil Premium", description: "Teknik pencucian presisi menggunakan bahan pH netral.", icon: "Droplets" },
      { id: "protection", name: "Nano Ceramic", description: "Lapisan pelindung permanen untuk menjaga kilap tahan lama.", icon: "ShieldCheck" }
    ];

    return base.map((svc, idx) => {
      // Find fallback placeholder if no image URL is provided in the document
      const placeholder = PlaceHolderImages.find(i => i.id === svc.id) || PlaceHolderImages[idx % 5 + 1];

      return {
        ...svc,
        imageUrl: svc.imageUrl || placeholder?.imageUrl || "https://picsum.photos/seed/service/800/600",
        IconComponent: ICON_MAP[svc.icon as string] || Sparkles
      };
    });
  }, [remoteServices]);

  return (
    <section id="layanan" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mb-12 md:mb-20 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Premium Experience</span>
          </div>
          <h2 className="text-3xl md:text-6xl font-headline font-black text-primary leading-tight tracking-tighter">
            Layanan Unggulan Kami
          </h2>
          <p className="text-muted-foreground text-base md:text-xl font-medium max-w-2xl">
            Solusi perawatan otomotif eksklusif dengan teknologi terkini dan standar kualitas tinggi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative min-h-[400px]">
          {isSvcLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-10" />
            </div>
          )}

          {services.map((service, idx) => (
            <div 
              key={service.id} 
              className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100 hover:border-secondary/50 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={service.imageUrl}
                  alt={service.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                <div className="absolute bottom-6 left-6 flex items-center justify-center bg-secondary p-3 rounded-2xl shadow-xl shadow-secondary/30 transform group-hover:rotate-12 transition-transform">
                  <service.IconComponent className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="p-8 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-primary group-hover:text-secondary transition-colors duration-300 tracking-tight">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    {service.description}
                  </p>
                </div>
              </div>
              
              <div className="absolute top-4 right-8 text-white/10 text-6xl font-black italic pointer-events-none group-hover:text-secondary/10 transition-colors">
                0{idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
