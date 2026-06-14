
'use client';

import React, { useEffect, useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, orderBy, limit, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Wrench, 
  Calendar, 
  ShieldCheck,
  PhoneCall,
  Clock,
  CheckCircle2,
  Bell,
  Play,
  ImageIcon,
  AlertTriangle,
  Send,
  Loader2,
  MonitorPlay,
  CalendarCheck,
  MapPin
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Image from "next/image";
import { getEmbedUrl, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { requestAndStoreFCMToken } from "@/firebase/messaging";
import { format } from "date-fns";

export default function MemberDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isActivating, setIsActivating] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Profile data
  const memberProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "members", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(memberProfileRef);

  // Upcoming Schedules
  const schedulesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "serviceSchedules"),
      where("memberId", "==", user.uid),
      where("status", "==", "scheduled"),
      orderBy("appointmentDate", "asc"),
      limit(1)
    );
  }, [db, user?.uid]);

  const { data: schedules } = useCollection(schedulesQuery);

  // My Active Queue
  const myQueueQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "queueEntries"),
      where("memberId", "==", user.uid),
      where("status", "in", ["waiting", "calling", "washing"]),
      limit(1)
    );
  }, [db, user?.uid]);

  const historyQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "serviceOrders"),
      where("memberId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );
  }, [db, user?.uid]);

  const promosQuery = useMemoFirebase(() => {
    return query(
      collection(db, "promos"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
      limit(10)
    );
  }, [db]);

  const { data: myQueue } = useCollection(myQueueQuery);
  const { data: history, isLoading: isHistoryLoading } = useCollection(historyQuery);
  const { data: promos, isLoading: isPromosLoading } = useCollection(promosQuery);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handleActivateNotifications = async () => {
    if (!user) return;
    setIsActivating(true);
    try {
      const token = await requestAndStoreFCMToken(user.uid);
      if (token) {
        toast({ title: "Perangkat Terdaftar", description: "Notifikasi servis berhasil diaktifkan." });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal Mengaktifkan", description: err.message });
    } finally {
      setIsActivating(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-20 space-y-8 md:space-y-12">
        
        {/* Welcome Section */}
        <div className="bg-primary rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 text-white relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 text-[9px] font-black uppercase tracking-[0.2em]">
              <ShieldCheck className="h-3.5 w-3.5 text-green-400" /> Verified Member
            </div>
            <h1 className="text-3xl md:text-6xl font-[900] italic uppercase tracking-tighter leading-none">
              Halo, <br /><span className="text-white/80">{profile?.fullName || user.email?.split('@')[0]}</span>
            </h1>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleActivateNotifications} disabled={isActivating} className="bg-secondary text-primary rounded-full font-bold h-12 px-8 hover:bg-secondary/90 transition-all uppercase text-xs tracking-widest">
                {isActivating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                {isActivating ? "Mendaftarkan..." : "Aktifkan Notifikasi"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            
            {/* Real-time Queue Tracking */}
            {myQueue && myQueue.length > 0 && (
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-secondary text-primary overflow-hidden relative">
                <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="h-24 w-24 md:h-32 md:w-32 rounded-3xl bg-primary text-white flex items-center justify-center shrink-0 shadow-2xl">
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase opacity-50">Antrian</p>
                      <p className="text-5xl md:text-6xl font-black">{myQueue[0].queueNumber}</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">Status Antrian</h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <Badge className="bg-primary/20 text-primary border-primary/30 rounded-full font-black uppercase px-4 py-1">
                        {myQueue[0].status === "waiting" ? "MENUNGGU" : `DIKERJAKAN: ${myQueue[0].slot}`}
                      </Badge>
                      <span className="text-xs md:text-lg font-bold opacity-60">{myQueue[0].serviceType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* UPCOMING SERVICE SCHEDULE - NEW FEATURE */}
            {schedules && schedules.length > 0 && (
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden border border-primary/10">
                <CardHeader className="p-8 pb-4 border-b border-dashed flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <CalendarCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black italic uppercase tracking-tight">Jadwal Servis Mendatang</CardTitle>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">JANJI TEMU TERKONFIRMASI</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 font-black text-[10px] px-4 py-1 rounded-full border-none">DIJADWALKAN</Badge>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Waktu & Layanan</p>
                        <h3 className="text-3xl font-[900] text-primary leading-none uppercase italic">
                          {format(new Date(schedules[0].appointmentDate), 'dd MMMM yyyy')}
                        </h3>
                        <p className="text-xl font-bold text-muted-foreground flex items-center gap-2">
                          <Clock className="h-5 w-5 text-secondary" /> {format(new Date(schedules[0].appointmentDate), 'HH:mm')} WIB
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-bold bg-secondary/10 p-3 rounded-xl border border-secondary/20">
                        <Wrench className="h-5 w-5 text-primary" /> {schedules[0].serviceType}
                      </div>
                    </div>
                    <div className="space-y-4 w-full md:w-auto">
                      <div className="p-4 bg-muted/30 rounded-2xl border text-xs font-medium italic text-muted-foreground max-w-xs">
                        "{schedules[0].notes || 'Pastikan kendaraan dalam kondisi siap saat servis.'}"
                      </div>
                      <Button asChild className="w-full h-12 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">
                        <a href="https://wa.me/628112612237" target="_blank" rel="noopener noreferrer">
                          <PhoneCall className="h-4 w-4 mr-2" /> UBAH JADWAL
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History List */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">Riwayat Perawatan</h2>
              {isHistoryLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-[2rem]" />)
              ) : history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((order) => (
                    <Card key={order.id} className="border-none shadow-xl rounded-[2rem] bg-background/50 backdrop-blur-sm group hover:shadow-2xl transition-all">
                      <CardContent className="p-6 md:p-10">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex items-start gap-6">
                            <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <Wrench className="h-8 w-8 md:h-10 md:w-10" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-primary opacity-60" />
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                  {format(new Date(order.createdAt), 'dd MMM yyyy')}
                                </p>
                              </div>
                              <h3 className="text-xl font-[900] uppercase tracking-tight">{order.serviceType}</h3>
                              <p className="text-xs text-muted-foreground font-bold italic">{order.carModel}</p>
                            </div>
                          </div>
                          <div className="flex items-center md:items-end flex-row md:flex-col justify-between md:justify-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                            <Badge className="bg-green-100 text-green-700 rounded-full font-black text-[9px] uppercase px-3 border-none">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> SELESAI
                            </Badge>
                            <p className="text-2xl md:text-3xl font-black text-primary tabular-nums">
                              Rp {order.totalCost?.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center bg-background/40 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center gap-4">
                  <History className="h-12 w-12 opacity-10" />
                  <p className="font-bold text-muted-foreground">Belum ada riwayat servis.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* Promo Slider */}
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Promo Spesial</h2>
              {isPromosLoading ? (
                <Skeleton className="h-64 rounded-[2rem]" />
              ) : promos && promos.length > 0 ? (
                <Carousel setApi={setApi} className="w-full">
                  <CarouselContent>
                    {promos.map((promo) => (
                      <CarouselItem key={promo.id}>
                        <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border-4 border-white">
                          <Image src={promo.imageUrl} alt={promo.title} fill className="object-cover opacity-80" unoptimized />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-8 space-y-2">
                            <h3 className="text-white text-3xl font-black uppercase italic italic leading-none">{promo.title}</h3>
                            <p className="text-white/70 text-xs line-clamp-2">{promo.description}</p>
                            {promo.link && (
                              <Button asChild size="sm" className="w-fit bg-secondary text-primary rounded-full font-black uppercase text-[10px] mt-4">
                                <a href={promo.link} target="_blank" rel="noopener noreferrer">Ambil Promo</a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : null}
            </div>

            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-black text-white p-10 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full -mr-20 -mt-20 blur-[60px]" />
              <div className="space-y-4 relative z-10">
                <h3 className="text-4xl font-[900] italic uppercase leading-none tracking-tighter">Emergency <br /><span className="text-primary">Roadside</span></h3>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Kargloss Team siap meluncur ke lokasi Anda 24/7.</p>
              </div>
              <Button asChild className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest gap-3 text-sm shadow-xl relative z-10">
                <a href="https://wa.me/628112612237" target="_blank" rel="noopener noreferrer">
                  <PhoneCall className="h-5 w-5" /> HUBUNGI SEKARANG
                </a>
              </Button>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
