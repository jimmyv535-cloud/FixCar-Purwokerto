
'use client';

import React, { useState, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function BookingSection() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Fetch Dynamic Services for Dropdown
  const servicesQuery = useMemoFirebase(() => query(collection(db, "services"), orderBy("name", "asc")), [db]);
  const { data: services } = useCollection(servicesQuery);

  // Fetch Dynamic Workshop Info
  const workshopRef = useMemoFirebase(() => doc(db, "siteSettings", "workshop"), [db]);
  const { data: workshop } = useDoc(workshopRef);

  const info = useMemo(() => {
    return {
      businessName: workshop?.businessName || "KARGLOSS",
      email: workshop?.email || "info@kargloss.id",
      description: workshop?.bookingDescription || "Ada pertanyaan mengenai layanan kami atau ingin melakukan booking service? Jangan ragu untuk menghubungi tim kami melalui formulir atau kontak di bawah ini.",
      phone: workshop?.phone || "+62 811-2612-237",
      address: workshop?.address || "Jl. Raya Baturraden KM 5, Pabuaran",
      hours: workshop?.operationHours || "Senin - Minggu: 08:00 - 17:00"
    };
  }, [workshop]);

  const [formData, setFormData] = useState({
    senderName: "",
    phone: "",
    carType: "",
    serviceType: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.senderName || !formData.phone || !formData.serviceType) {
      toast({
        variant: "destructive",
        title: "Mohon lengkapi data",
        description: "Nama, No. Telepon, dan Jenis Layanan wajib diisi.",
      });
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        ...formData,
        submissionDateTime: new Date().toISOString(),
        isRead: false,
        source: "Website Booking Form"
      };

      await addDocumentNonBlocking(collection(db, "contactMessages"), bookingData);
      
      toast({
        title: "Pendaftaran Terkirim!",
        description: "Tim kami akan segera menghubungi Anda melalui WhatsApp.",
      });

      setFormData({
        senderName: "",
        phone: "",
        carType: "",
        serviceType: "",
        message: ""
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="py-24 bg-secondary/5 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Side: Contact Info */}
          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-secondary font-black uppercase tracking-[0.3em] text-xs">Booking & Konsultasi</p>
              <h2 className="text-4xl md:text-6xl font-headline font-black text-primary italic uppercase tracking-tighter leading-none">
                HUBUNGI <span className="text-secondary">{info.businessName}</span>
              </h2>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-lg">
                {info.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-xl shadow-primary/5">
                  <Phone className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-black uppercase text-xs tracking-widest text-primary mb-1">WhatsApp</h4>
                  <p className="text-sm font-bold text-muted-foreground">{info.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-xl shadow-primary/5">
                  <Mail className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-black uppercase text-xs tracking-widest text-primary mb-1">Email</h4>
                  <p className="text-sm font-bold text-muted-foreground">{info.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-xl shadow-primary/5">
                  <MapPin className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-black uppercase text-xs tracking-widest text-primary mb-1">Lokasi</h4>
                  <p className="text-sm font-bold text-muted-foreground line-clamp-2">{info.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-xl shadow-primary/5">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-black uppercase text-xs tracking-widest text-primary mb-1">Jam Operasional</h4>
                  <p className="text-sm font-bold text-muted-foreground">{info.hours}</p>
                </div>
              </div>
            </div>

            {/* Fast Response Box */}
            <div className="bg-primary rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden group shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-secondary/30 transition-colors" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <MessageSquare className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight">Fast Response via WhatsApp</h3>
                </div>
                <p className="text-white/60 text-sm font-medium">Klik tombol di bawah untuk terhubung langsung dengan Customer Service kami.</p>
                <Button asChild className="w-full h-14 bg-white text-primary hover:bg-secondary hover:text-primary rounded-2xl font-black uppercase italic tracking-tighter text-lg transition-all">
                  <a href={`https://wa.me/${info.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    Chat Sekarang
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side: Form Card */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-primary/5 border border-white">
            <div className="space-y-2 mb-8">
              <h3 className="text-2xl font-black italic uppercase text-primary">Formulir Layanan</h3>
              <p className="text-muted-foreground text-sm font-medium">Lengkapi data di bawah ini untuk mempermudah pendaftaran.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary/50 ml-1">Nama Lengkap</Label>
                  <Input 
                    placeholder="Contoh: Budi Santoso" 
                    value={formData.senderName}
                    onChange={e => setFormData({...formData, senderName: e.target.value})}
                    className="h-14 bg-secondary/5 border-none rounded-2xl font-bold placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary/50 ml-1">Nomor Telepon / WA</Label>
                  <Input 
                    placeholder="Contoh: 0812xxxxxxx" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="h-14 bg-secondary/5 border-none rounded-2xl font-bold placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary/50 ml-1">Merek & Tipe Mobil</Label>
                  <Input 
                    placeholder="Contoh: Toyota Avanza 2020" 
                    value={formData.carType}
                    onChange={e => setFormData({...formData, carType: e.target.value})}
                    className="h-14 bg-secondary/5 border-none rounded-2xl font-bold placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary/50 ml-1">Jenis Layanan</Label>
                  <Select 
                    value={formData.serviceType} 
                    onValueChange={v => setFormData({...formData, serviceType: v})}
                  >
                    <SelectTrigger className="h-14 bg-secondary/5 border-none rounded-2xl font-bold focus:ring-2 focus:ring-secondary/50">
                      <SelectValue placeholder="Pilih Layanan" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      {services?.map(s => (
                        <SelectItem key={s.id} value={s.name} className="font-bold uppercase text-[10px]">
                          {s.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="Konsultasi Layanan" className="font-bold uppercase text-[10px]">Konsultasi Layanan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/50 ml-1">Pesan / Keluhan Tambahan</Label>
                <Textarea 
                  placeholder="Jelaskan kebutuhan atau keluhan mobil Anda..." 
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="min-h-[120px] bg-secondary/5 border-none rounded-2xl font-bold placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-secondary/50 resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase italic tracking-widest text-lg shadow-xl shadow-primary/20 gap-3 group transition-all"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Kirim Pendaftaran</>}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
