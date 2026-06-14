
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Instagram, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function InstagramSection() {
  const db = useFirestore();
  
  // Fetch Instagram settings from Firestore
  const igSettingsRef = useMemoFirebase(() => doc(db, "siteSettings", "instagram"), [db]);
  const { data: igSettings, isLoading } = useDoc(igSettingsRef);

  // Metadata for the section
  const info = useMemo(() => {
    return {
      handle: igSettings?.handle || "@karglossautocare.purwokerto",
      description: igSettings?.description || "Temukan inspirasi perawatan mobil harian dan momen terbaik kami di Instagram resmi Kargloss Autocare.",
      buttonLink: igSettings?.buttonLink || "https://www.instagram.com/karglossautocare.purwokerto/"
    };
  }, [igSettings]);

  // Combine Firestore data with local placeholders as fallback for images
  const igImages = useMemo(() => {
    const defaults = [
      { id: "ig-1", url: PlaceHolderImages.find(img => img.id === "ig-1")?.imageUrl || "" },
      { id: "ig-2", url: PlaceHolderImages.find(img => img.id === "ig-2")?.imageUrl || "" },
      { id: "ig-3", url: PlaceHolderImages.find(img => img.id === "ig-3")?.imageUrl || "" },
      { id: "ig-4", url: PlaceHolderImages.find(img => img.id === "ig-4")?.imageUrl || "" },
    ];

    if (!igSettings || !igSettings.images) return defaults;

    return defaults.map(def => {
      const remote = igSettings.images.find((img: any) => img.id === def.id);
      return remote && remote.url ? { ...def, url: remote.url } : def;
    });
  }, [igSettings]);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <p className="text-xs font-black text-secondary uppercase tracking-[0.3em]">
            Ikuti Perjalanan Kami
          </p>
          <div className="flex items-center justify-center gap-2 md:gap-3 px-2">
            <Instagram className="h-6 w-6 md:h-8 md:w-8 text-primary shrink-0" />
            <h2 className="text-lg sm:text-2xl md:text-5xl font-headline font-black text-primary tracking-tighter">
              {info.handle}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium text-sm md:text-base">
            {info.description}
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 relative min-h-[300px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            </div>
          ) : null}
          
          {igImages.map((img, idx) => (
            <div 
              key={idx} 
              className="group relative aspect-square overflow-hidden rounded-[2rem] shadow-xl border border-border transition-transform duration-500 hover:-translate-y-2 bg-secondary/10"
            >
              <Image
                src={img.url}
                alt={`Instagram Post ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="text-white h-10 w-10 transform scale-50 group-hover:scale-100 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button 
            asChild 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-14 px-10 font-bold shadow-2xl shadow-primary/20"
          >
            <a 
              href={info.buttonLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Instagram className="h-5 w-5" />
              Kunjungi Instagram Kami
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
