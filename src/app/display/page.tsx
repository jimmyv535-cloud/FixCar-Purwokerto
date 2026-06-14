
"use client";

import { useEffect, useRef, useState } from "react";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Volume2, UserCheck, Clock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QueueDisplayPage() {
  const firestore = useFirestore();
  const lastCalledId = useRef<string | null>(null);
  const lastCalledAt = useRef<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pre-load voices for mobile browsers
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const activeSlotsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "queueEntries"), 
      where("status", "in", ["calling", "washing"]), 
      orderBy("calledAt", "desc")
    );
  }, [firestore]);

  const waitingQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "queueEntries"), 
      where("status", "==", "waiting"), 
      orderBy("createdAt", "asc")
    );
  }, [firestore]);

  const { data: activeQueue = [] } = useCollection(activeSlotsQuery);
  const { data: waitingList = [] } = useCollection(waitingQuery);

  useEffect(() => {
    if (activeQueue && activeQueue.length > 0 && isAudioEnabled) {
      const latest = activeQueue[0] as any;
      
      if (latest.id !== lastCalledId.current || latest.calledAt !== lastCalledAt.current) {
        lastCalledId.current = latest.id;
        lastCalledAt.current = latest.calledAt;
        announceQueue(latest.queueNumber, latest.slot, latest.serviceType);
      }
    }
  }, [activeQueue, isAudioEnabled]);

  const announceQueue = (number: number, slot: string, service: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const msg = new SpeechSynthesisUtterance();
      const isCuci = service?.toLowerCase().includes("cuci");
      
      if (isCuci) {
        msg.text = `Nomor Antrian ${number}, silakan ke ${slot || 'area pengerjaan'}`;
      } else {
        msg.text = `Nomor Antrian ${number}, silakan ke bagian ${service || 'layanan'}`;
      }
      
      // Force Indonesian Voice Selection for Mobile
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.includes('ID') || v.lang.includes('id'));
      if (idVoice) {
        msg.voice = idVoice;
      }
      
      msg.lang = 'id-ID';
      msg.rate = 0.85;
      msg.pitch = 1;
      window.speechSynthesis.speak(msg);
    }
  };

  const enableAudio = () => {
    setIsAudioEnabled(true);
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance("Sistem monitor antrian diaktifkan");
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.includes('ID') || v.lang.includes('id'));
      if (idVoice) msg.voice = idVoice;
      msg.lang = 'id-ID';
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#111] flex flex-col font-body lg:overflow-hidden text-black select-none">
      {!isAudioEnabled && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center space-y-8">
          <div className="h-24 w-24 md:h-32 md:w-32 bg-secondary rounded-full flex items-center justify-center animate-pulse">
            <Volume2 className="h-12 w-12 md:h-16 md:w-16 text-primary" />
          </div>
          <div className="space-y-4 max-w-md">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">Aktifkan Suara</h2>
            <p className="text-white/60 font-medium text-sm md:text-base">Gunakan tombol di bawah untuk mengizinkan sistem melakukan panggilan suara dalam Bahasa Indonesia.</p>
          </div>
          <Button 
            onClick={enableAudio}
            size="lg" 
            className="h-16 md:h-20 px-8 md:px-12 rounded-2xl md:rounded-[2rem] bg-secondary text-primary hover:bg-secondary/90 text-xl md:text-2xl font-black uppercase tracking-widest shadow-2xl"
          >
            <PlayCircle className="mr-3 h-6 w-6 md:h-8 md:w-8" /> MULAI MONITOR
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="h-auto md:h-[12vh] bg-black px-4 md:px-8 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between border-b border-white/5 relative z-10 shrink-0 gap-4">
        <div className="flex items-center space-x-4 text-white">
          <div className="bg-secondary p-2 md:p-3 rounded-xl md:rounded-2xl shadow-xl">
            <Car className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-tighter uppercase leading-none">Kargloss Autocare</h1>
            <p className="text-[8px] md:text-[10px] font-black text-secondary uppercase tracking-[0.3em] mt-1">Premium Digital Queue</p>
          </div>
        </div>
        <div className="text-center md:text-right text-white">
          {currentTime ? (
            <>
              <div className="flex items-center justify-center md:justify-end gap-2 md:gap-3">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-secondary" />
                <p className="text-2xl md:text-4xl font-black tabular-nums leading-none">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <p className="text-[8px] md:text-[10px] uppercase text-white/40 font-black tracking-widest mt-1">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </>
          ) : (
            <div className="h-10 w-32 bg-white/10 animate-pulse rounded-lg" />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-6 gap-6 relative z-10 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Grid of 4 Slots */}
        <div className="flex-[3] grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {["Slot A", "Slot B", "Slot C", "Slot D"].map(slotName => {
            const active = activeQueue?.find((s: any) => s.slot === slotName);
            return (
              <Card 
                key={slotName} 
                className={`border-none shadow-2xl relative overflow-hidden transition-all duration-700 rounded-3xl md:rounded-[2rem] flex flex-col h-64 sm:h-auto min-h-[200px] ${active ? 'bg-white ring-4 md:ring-8 ring-secondary/50 scale-[1.01]' : 'bg-[#222]'}`}
              >
                {active ? (
                  <div className="flex flex-col h-full p-6 md:p-8 relative">
                    <div className="absolute top-6 left-6 md:top-8 md:left-8">
                       <span className="text-xl md:text-3xl font-black uppercase text-muted-foreground/40 tracking-tighter">
                         {slotName.replace('Slot ', 'SLOT - ')}
                       </span>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-8xl sm:text-9xl lg:text-[11rem] font-black leading-none text-black tracking-tighter animate-in zoom-in duration-500">
                        {active.queueNumber}
                      </div>
                    </div>

                    <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8">
                      <div className="px-3 py-1 md:px-5 md:py-2 bg-secondary/20 text-primary border border-secondary/30 rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-tight whitespace-nowrap">
                        {active.serviceType}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full items-center justify-center relative bg-[#333]">
                    <div className="absolute top-6 w-full text-center">
                       <span className="text-lg md:text-2xl font-black uppercase text-white/10 tracking-tighter">
                         {slotName.toUpperCase()}
                       </span>
                    </div>
                    <div className="text-4xl md:text-7xl font-black text-white/5 uppercase rotate-[-15deg] select-none">
                      TERSEDIA
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Waiting List Sidebar */}
        <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0">
          <Card className="bg-white/95 backdrop-blur-md rounded-3xl md:rounded-[2.5rem] flex-1 flex flex-col shadow-2xl border-none overflow-hidden">
            <div className="p-5 md:p-6 border-b-4 border-secondary flex items-center justify-between shrink-0">
              <span className="flex items-center italic uppercase tracking-tighter text-xl md:text-2xl font-black text-primary">
                <UserCheck className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6 text-secondary" /> Antrian
              </span>
              <div className="bg-primary text-white text-[10px] md:text-xs font-black h-7 w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center">
                {waitingList?.length || 0}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 min-h-0 scrollbar-hide">
              {waitingList?.slice(0, 10).map((q: any, idx: number) => (
                <div key={q.id} className="flex items-center justify-between bg-secondary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border-l-[6px] md:border-l-[8px] border-primary animate-in slide-in-from-right duration-500 shrink-0" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <span className="text-3xl md:text-4xl font-black text-primary italic">#{q.queueNumber}</span>
                    <div className="space-y-0.5">
                       <span className="font-black text-xs md:text-sm uppercase tracking-tight text-primary/90 block truncate max-w-[100px] md:max-w-[120px]">{q.customerName}</span>
                       <span className="text-[7px] md:text-[8px] font-bold uppercase text-muted-foreground tracking-widest">{q.serviceType}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!waitingList || waitingList.length === 0) && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic font-medium opacity-30 py-10">
                  <Clock className="h-10 w-10 md:h-12 md:w-12 mb-4" />
                  <p className="font-bold uppercase tracking-widest text-[10px] md:text-xs">Belum ada antrian</p>
                </div>
              )}
            </div>
            
            <div className="p-4 md:p-6 pt-0 mt-auto shrink-0">
              <div className="bg-black text-white p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-full -mr-6 -mt-6 md:-mr-8 md:-mt-8" />
                <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] opacity-50 mb-1 md:mb-2">INFO</p>
                <p className="text-[10px] md:text-xs leading-relaxed font-bold italic opacity-90">
                  "Siapkan unit Anda di drop-zone saat nomor dipanggil."
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Footer Ticker */}
      <div className="h-10 md:h-[6vh] bg-secondary flex items-center overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.1)] relative z-20 shrink-0">
        <div className="whitespace-nowrap animate-marquee flex items-center space-x-10 md:space-x-20">
          <span className="text-primary font-black uppercase text-sm md:text-lg italic tracking-tighter">BUKA SETIAP HARI: 08:00 - 17:00</span>
          <span className="text-primary font-black text-lg md:text-xl">•</span>
          <span className="text-primary font-black uppercase text-sm md:text-lg italic tracking-tighter">NANO CERAMIC COATING SPECIALIST</span>
          <span className="text-primary font-black text-lg md:text-xl">•</span>
          <span className="text-primary font-black uppercase text-sm md:text-lg italic tracking-tighter">PREMIUM CAR WASH & DETAILING</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
