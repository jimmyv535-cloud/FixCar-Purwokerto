
'use client';

import React, { useMemo } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Youtube, PlayCircle, Loader2, ArrowRight } from "lucide-react";
import { getEmbedUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function YoutubeSection() {
  const db = useFirestore();
  
  // Fetch workshop settings which contains the youtube link
  const workshopRef = useMemoFirebase(() => doc(db, "siteSettings", "workshop"), [db]);
  const { data: workshop, isLoading } = useDoc(workshopRef);

  const youtubeUrl = workshop?.youtubeLink || "https://www.youtube.com/@karglossautocare";
  const embed = useMemo(() => getEmbedUrl(youtubeUrl), [youtubeUrl]);

  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-600 uppercase tracking-widest">
            <Youtube className="h-3 w-3" /> Exclusive Content
          </div>
          <h2 className="text-3xl md:text-6xl font-headline font-black text-primary tracking-tighter uppercase italic">
            Kargloss <span className="text-red-600">YouTube</span> Channel
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium text-sm md:text-lg leading-relaxed">
            Lihat proses pengerjaan unit secara detail, tips perawatan mobil, dan momen seru di workshop kami.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="aspect-video w-full rounded-[2.5rem] bg-secondary/10 flex items-center justify-center border border-dashed border-primary/20">
              <Loader2 className="h-10 w-10 animate-spin text-red-600 opacity-20" />
            </div>
          ) : embed.type === 'video' ? (
            <div className="group relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-black border-4 border-white">
              <iframe 
                src={embed.url}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-6 flex-1 text-center md:text-left">
                <div className="h-20 w-20 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-600/30 mx-auto md:mx-0">
                  <Youtube className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">Follow Our Journey</h3>
                  <p className="text-muted-foreground font-medium text-lg leading-snug">
                    Dapatkan update terbaru seputar dunia car detailing langsung dari para ahli di Kargloss Autocare.
                  </p>
                </div>
                <Button asChild size="lg" className="h-14 px-10 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest gap-2">
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                    Kunjungi Channel <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
              </div>
              <div className="relative w-full max-w-[300px] md:max-w-none md:flex-1 aspect-square rounded-[2rem] overflow-hidden bg-secondary/5 flex items-center justify-center">
                 <PlayCircle className="h-32 w-32 text-red-600 opacity-10 animate-pulse" />
                 <div className="absolute inset-0 border-[20px] border-white/50 rounded-[2rem]" />
              </div>
            </div>
          )}
        </div>

        {/* CTA Link Below Embed */}
        {embed.type === 'video' && (
          <div className="mt-12 text-center">
            <Button asChild variant="outline" className="h-12 px-8 rounded-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold uppercase text-[10px] tracking-widest transition-all">
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Buka Semua Video di YouTube <Youtube className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
