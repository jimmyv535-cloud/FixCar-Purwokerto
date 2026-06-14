
'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ShieldCheck, 
  MapPin, 
  PhoneCall, 
  Instagram, 
  Save, 
  ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Wrench,
  Plus,
  Trash2,
  Edit2,
  Car,
  Droplets,
  Zap,
  Banknote,
  Layout,
  Monitor,
  Smartphone,
  Search,
  Image as ImageIconLucide,
  Clock,
  Map as MapIcon,
  Mail,
  Type,
  Youtube,
  Link as LinkIcon
} from "lucide-react";
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEmbedUrl } from "@/lib/utils";

const ICON_OPTIONS = [
  { label: "Sparkles", icon: Sparkles, value: "Sparkles" },
  { label: "Car", icon: Car, value: "Car" },
  { label: "Droplets", icon: Droplets, value: "Droplets" },
  { label: "Shield", icon: ShieldCheck, value: "ShieldCheck" },
  { label: "Wrench", icon: Wrench, value: "Wrench" },
  { label: "Zap", icon: Zap, value: "Zap" },
];

export default function SettingsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isOwner = user?.email === 'owner.kargloss@gmail.com';

  // Master Services
  const servicesQuery = useMemoFirebase(() => query(collection(db, "services"), orderBy("name", "asc")), [db]);
  const { data: services, isLoading: isServicesLoading } = useCollection(servicesQuery);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    description: "",
    price: "" as string | number,
    icon: "Sparkles",
    imageUrl: ""
  });

  // General Settings (Identity & Branding)
  const generalSettingsRef = useMemoFirebase(() => doc(db, "siteSettings", "general"), [db]);
  const { data: generalSettings } = useDoc(generalSettingsRef);
  const [generalData, setGeneralData] = useState({
    logoUrl: "https://i.imgur.com/eoWaIfA.jpeg",
    heroImageUrl: "",
    favicon48: "https://i.imgur.com/uU7xwVk.jpeg",
    favicon96: "https://i.imgur.com/uU7xwVk.jpeg",
    favicon192: "https://i.imgur.com/uU7xwVk.jpeg",
    appleTouchIcon: "https://i.imgur.com/uU7xwVk.jpeg"
  });

  useEffect(() => {
    if (generalSettings) {
      setGeneralData({
        logoUrl: generalSettings.logoUrl || "https://i.imgur.com/eoWaIfA.jpeg",
        heroImageUrl: generalSettings.heroImageUrl || "",
        favicon48: generalSettings.favicon48 || generalSettings.faviconUrl || "https://i.imgur.com/uU7xwVk.jpeg",
        favicon96: generalSettings.favicon96 || "https://i.imgur.com/uU7xwVk.jpeg",
        favicon192: generalSettings.favicon192 || "https://i.imgur.com/uU7xwVk.jpeg",
        appleTouchIcon: generalSettings.appleTouchIcon || "https://i.imgur.com/uU7xwVk.jpeg"
      });
    }
  }, [generalSettings]);

  // Workshop & Maps Info
  const workshopSettingsRef = useMemoFirebase(() => doc(db, "siteSettings", "workshop"), [db]);
  const { data: workshopSettings } = useDoc(workshopSettingsRef);
  const [workshopData, setWorkshopData] = useState({
    businessName: "KARGLOSS",
    email: "info@kargloss.id",
    bookingDescription: "Ada pertanyaan mengenai layanan kami atau ingin melakukan booking service? Jangan ragu untuk menghubungi tim kami melalui formulir atau kontak di bawah ini.",
    address: "Jl. Raya Baturraden KM 5, Pabuaran, Purwokerto Utara, Kabupaten Banyumas, Jawa Tengah",
    operationHours: "Senin - Minggu: 08:00 - 17:00 WIB",
    phone: "+62 811-2612-237",
    instagramHandle: "@karglossautocare.purwokerto",
    instagramLink: "https://www.instagram.com/karglossautocare.purwokerto/",
    youtubeLink: "https://www.youtube.com/@karglossautocare",
    mapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.7060027855587!2d109.2431763!3d-7.386805699999999!2m3!1f0!2v0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e655f05936ebee3%3A0xd66f491f3cea090a!2sCuci%20Mobil%20%7C%20Salon%20Mobil%20%7C%20Cafe%20%26%20Resto%20%7C%20SPKLU%20-%20Kargloss%20Autocare%20%26%20Cafe%20Purwokerto!5e0!3m2!1sid!2sid!4v1774438938288!5m2!1sid!2sid"
  });

  useEffect(() => {
    if (workshopSettings) {
      setWorkshopData({
        businessName: workshopSettings.businessName || "KARGLOSS",
        email: workshopSettings.email || "info@kargloss.id",
        bookingDescription: workshopSettings.bookingDescription || workshopData.bookingDescription,
        address: workshopSettings.address || workshopData.address,
        operationHours: workshopSettings.operationHours || workshopData.operationHours,
        phone: workshopSettings.phone || workshopData.phone,
        instagramHandle: workshopSettings.instagramHandle || workshopData.instagramHandle,
        instagramLink: workshopSettings.instagramLink || workshopData.instagramLink,
        youtubeLink: workshopSettings.youtubeLink || workshopData.youtubeLink,
        mapsUrl: workshopSettings.mapsUrl || workshopData.mapsUrl
      });
    }
  }, [workshopSettings]);

  // Images & IG
  const igSettingsRef = useMemoFirebase(() => doc(db, "siteSettings", "instagram"), [db]);
  const { data: igSettingsData } = useDoc(igSettingsRef);
  
  const [igImages, setIgImages] = useState([
    { id: "ig-1", url: "" },
    { id: "ig-2", url: "" },
    { id: "ig-3", url: "" },
    { id: "ig-4", url: "" }
  ]);

  const [igMeta, setIgMeta] = useState({
    handle: "@karglossautocare.purwokerto",
    description: "Temukan inspirasi perawatan mobil harian dan momen terbaik kami di Instagram resmi Kargloss Autocare.",
    buttonLink: "https://www.instagram.com/karglossautocare.purwokerto/"
  });

  useEffect(() => {
    if (igSettingsData) {
      if (igSettingsData.images) setIgImages(igSettingsData.images);
      setIgMeta({
        handle: igSettingsData.handle || "@karglossautocare.purwokerto",
        description: igSettingsData.description || "Temukan inspirasi perawatan mobil harian dan momen terbaik kami di Instagram resmi Kargloss Autocare.",
        buttonLink: igSettingsData.buttonLink || "https://www.instagram.com/karglossautocare.purwokerto/"
      });
    }
  }, [igSettingsData]);

  const handleUpdateIgUrl = (id: string, url: string) => {
    setIgImages(prev => prev.map(img => img.id === id ? { ...img, url } : img));
  };

  const handleSaveGeneral = () => {
    setLoading(true);
    setDocumentNonBlocking(generalSettingsRef, { ...generalData, updatedAt: new Date().toISOString() }, { merge: true });
    toast({ title: "Identitas Visual Diperbarui" });
    setLoading(false);
  };

  const handleSaveWorkshop = () => {
    setLoading(true);
    setDocumentNonBlocking(workshopSettingsRef, { ...workshopData, updatedAt: new Date().toISOString() }, { merge: true });
    toast({ title: "Informasi Workshop Diperbarui" });
    setLoading(false);
  };

  const handleSaveMedia = () => {
    setLoading(true);
    setDocumentNonBlocking(igSettingsRef, { 
      images: igImages, 
      ...igMeta,
      updatedAt: new Date().toISOString() 
    }, { merge: true });
    toast({ title: "Media Visual Diperbarui" });
    setLoading(false);
  };

  const handleOpenServiceModal = (service?: any) => {
    if (service) {
      setEditingService(service);
      setServiceFormData({ 
        name: service.name, 
        description: service.description || "", 
        price: service.price || "",
        icon: service.icon || "Sparkles",
        imageUrl: service.imageUrl || ""
      });
    } else {
      setEditingService(null);
      setServiceFormData({ name: "", description: "", price: "", icon: "Sparkles", imageUrl: "" });
    }
    setIsServiceModalOpen(true);
  };

  const handleSaveService = () => {
    if (!serviceFormData.name) return;
    const finalData = {
      ...serviceFormData,
      price: parseInt(serviceFormData.price.toString().replace(/\D/g, "")) || 0
    };

    if (editingService) {
      updateDocumentNonBlocking(doc(db, "services", editingService.id), finalData);
      toast({ title: "Layanan Diperbarui" });
    } else {
      addDocumentNonBlocking(collection(db, "services"), finalData);
      toast({ title: "Layanan Ditambahkan" });
    }
    setIsServiceModalOpen(false);
  };

  const handleDeleteService = (id: string, name: string) => {
    if (confirm(`Hapus layanan "${name}"?`)) {
      deleteDocumentNonBlocking(doc(db, "services", id));
      toast({ title: "Layanan Dihapus" });
    }
  };

  const youtubePreview = getEmbedUrl(workshopData.youtubeLink);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Pengaturan</h1>
          <p className="text-muted-foreground font-medium">Kelola data master, identitas bisnis, dan dukungan PWA.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-12">
          
          {/* Identity & Branding Settings */}
          {isOwner && (
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-background border">
              <CardHeader className="p-8 bg-secondary/10 border-b">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black uppercase italic flex items-center gap-3">
                      <Layout className="h-6 w-6 text-primary" />
                      Manajemen Branding & PWA
                    </CardTitle>
                    <CardDescription>Atur logo, banner header, dan ikon untuk berbagai perangkat.</CardDescription>
                  </div>
                  <Button onClick={handleSaveGeneral} disabled={loading} className="rounded-xl font-bold uppercase text-[10px] gap-2">
                    <Save className="h-4 w-4" /> SIMPAN BRANDING
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <Tabs defaultValue="logo" className="space-y-8">
                  <TabsList className="bg-secondary/20 p-1 rounded-xl h-12 w-full">
                    <TabsTrigger value="logo" className="flex-1 rounded-lg font-bold text-[10px] uppercase">LOGO & BANNER</TabsTrigger>
                    <TabsTrigger value="favicon" className="flex-1 rounded-lg font-bold text-[10px] uppercase">BROWSER (ICO/PNG)</TabsTrigger>
                    <TabsTrigger value="mobile" className="flex-1 rounded-lg font-bold text-[10px] uppercase">MOBILE (PWA/IOS)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="logo" className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Logo Workshop</Label>
                        <div className="h-32 w-full relative bg-secondary/10 rounded-2xl overflow-hidden border border-dashed border-primary/20 flex items-center justify-center">
                           {generalData.logoUrl ? (
                             <Image src={generalData.logoUrl} alt="Logo Preview" fill className="object-contain p-4" unoptimized />
                           ) : (
                             <ImageIcon className="h-10 w-10 opacity-10" />
                           )}
                        </div>
                        <Input 
                          placeholder="URL Logo (https://...)" 
                          value={generalData.logoUrl} 
                          onChange={e => setGeneralData({...generalData, logoUrl: e.target.value})} 
                          className="h-12 rounded-xl bg-secondary/5"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Banner Header (Hero)</Label>
                        <div className="h-32 w-full relative bg-secondary/10 rounded-2xl overflow-hidden border border-dashed border-primary/20 flex items-center justify-center">
                           {generalData.heroImageUrl ? (
                             <Image src={generalData.heroImageUrl} alt="Banner Preview" fill className="object-cover" unoptimized />
                           ) : (
                             <ImageIcon className="h-10 w-10 opacity-10" />
                           )}
                        </div>
                        <Input 
                          placeholder="URL Gambar Banner (https://...)" 
                          value={generalData.heroImageUrl} 
                          onChange={e => setGeneralData({...generalData, heroImageUrl: e.target.value})} 
                          className="h-12 rounded-xl bg-secondary/5"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="favicon" className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                          <Search className="h-3 w-3" /> Favicon 48x48 (Google Search)
                        </Label>
                        <div className="h-20 w-20 relative bg-secondary/10 rounded-xl overflow-hidden border border-dashed border-primary/20">
                           {generalData.favicon48 && <Image src={generalData.favicon48} alt="48x48" fill className="object-contain p-2" unoptimized />}
                        </div>
                        <Input 
                          placeholder="URL Ikon 48x48" 
                          value={generalData.favicon48} 
                          onChange={e => setGeneralData({...generalData, favicon48: e.target.value})} 
                          className="h-10 rounded-xl bg-secondary/5"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                          <Monitor className="h-3 w-3" /> Favicon 96x96 (Tab Browser)
                        </Label>
                        <div className="h-20 w-20 relative bg-secondary/10 rounded-xl overflow-hidden border border-dashed border-primary/20">
                           {generalData.favicon96 && <Image src={generalData.favicon96} alt="96x96" fill className="object-contain p-2" unoptimized />}
                        </div>
                        <Input 
                          placeholder="URL Ikon 96x96" 
                          value={generalData.favicon96} 
                          onChange={e => setGeneralData({...generalData, favicon96: e.target.value})} 
                          className="h-10 rounded-xl bg-secondary/5"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="mobile" className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                          <Smartphone className="h-3 w-3" /> Android 192x192 (PWA)
                        </Label>
                        <div className="h-32 w-32 relative bg-secondary/10 rounded-2xl overflow-hidden border border-dashed border-primary/20">
                           {generalData.favicon192 && <Image src={generalData.favicon192} alt="Android 192" fill className="object-contain p-4" unoptimized />}
                        </div>
                        <Input 
                          placeholder="URL Ikon 192x192" 
                          value={generalData.favicon192} 
                          onChange={e => setGeneralData({...generalData, favicon192: e.target.value})} 
                          className="h-10 rounded-xl bg-secondary/5"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                          <ImageIcon className="h-3 w-3" /> Apple Touch 180x180 (iOS)
                        </Label>
                        <div className="h-32 w-32 relative bg-secondary/10 rounded-2xl overflow-hidden border border-dashed border-primary/20">
                           {generalData.appleTouchIcon && <Image src={generalData.appleTouchIcon} alt="Apple 180" fill className="object-contain p-4" unoptimized />}
                        </div>
                        <Input 
                          placeholder="URL Apple Touch Icon" 
                          value={generalData.appleTouchIcon} 
                          onChange={e => setGeneralData({...generalData, appleTouchIcon: e.target.value})} 
                          className="h-10 rounded-xl bg-secondary/5"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Service Master Data */}
          {isOwner && (
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden border">
              <CardHeader className="p-8 bg-primary text-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black uppercase italic flex items-center gap-3">
                      <Zap className="h-6 w-6 text-secondary" />
                      Daftar Layanan & Harga
                    </CardTitle>
                    <CardDescription className="text-white/60">Layanan ini akan muncul di kartu "Layanan Unggulan Kami" di Landing Page.</CardDescription>
                  </div>
                  <Button onClick={() => handleOpenServiceModal()} variant="secondary" className="rounded-xl font-bold uppercase text-[10px] gap-2">
                    <Plus className="h-4 w-4" /> TAMBAH LAYANAN
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {isServicesLoading ? (
                    <div className="p-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></div>
                  ) : services?.map((svc) => (
                    <div key={svc.id} className="p-6 flex items-center justify-between hover:bg-secondary/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 relative rounded-xl bg-secondary/20 overflow-hidden border shrink-0">
                          {svc.imageUrl ? (
                            <Image src={svc.imageUrl} alt={svc.name} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              {React.createElement(ICON_OPTIONS.find(i => i.value === svc.icon)?.icon || Sparkles, { className: "h-6 w-6 text-primary" })}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black uppercase text-sm">{svc.name}</p>
                          <p className="text-xs font-bold text-primary mb-1">Rp {svc.price?.toLocaleString('id-ID') || 0}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-md">{svc.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenServiceModal(svc)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteService(svc.id, svc.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media Images & Instagram Metadata */}
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden border">
            <CardHeader className="p-8 bg-secondary/10 border-b">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black uppercase italic flex items-center gap-3">
                    <ImageIcon className="h-6 w-6 text-primary" />
                    Feed Instagram Landing Page
                  </CardTitle>
                </div>
                <Button onClick={handleSaveMedia} disabled={loading} className="rounded-xl font-bold uppercase text-[10px] gap-2">
                  <Save className="h-4 w-4" /> SIMPAN MEDIA
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
               {/* Instagram Metadata Editing */}
               <div className="grid md:grid-cols-2 gap-8 p-6 bg-secondary/5 rounded-3xl border border-dashed border-primary/10">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                        <Instagram className="h-3 w-3" /> Handle Instagram
                      </Label>
                      <Input 
                        value={igMeta.handle} 
                        onChange={e => setIgMeta({...igMeta, handle: e.target.value})} 
                        placeholder="@karglossautocare.purwokerto" 
                        className="h-12 rounded-xl bg-background border-none shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                        <LinkIcon className="h-3 w-3" /> Link Tombol Kunjungi
                      </Label>
                      <Input 
                        value={igMeta.buttonLink} 
                        onChange={e => setIgMeta({...igMeta, buttonLink: e.target.value})} 
                        placeholder="https://www.instagram.com/..." 
                        className="h-12 rounded-xl bg-background border-none shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Deskripsi Instagram</Label>
                    <Textarea 
                      value={igMeta.description} 
                      onChange={e => setIgMeta({...igMeta, description: e.target.value})} 
                      placeholder="Teks penjelasan feed Instagram..." 
                      className="h-32 rounded-xl bg-background border-none shadow-sm text-xs resize-none"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {igImages.map((img) => (
                  <div key={img.id} className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">IG Post {img.id.split('-')[1]}</Label>
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/20 border border-dashed border-primary/10">
                      {img.url ? (
                        <Image src={img.url} alt={img.id} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 opacity-10" />
                        </div>
                      )}
                    </div>
                    <Input placeholder="URL Gambar Instagram..." value={img.url} onChange={(e) => handleUpdateIgUrl(img.id, e.target.value)} className="h-10 rounded-xl bg-secondary/5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workshop & Contact Info Settings */}
          {isOwner && (
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-background border">
              <CardHeader className="p-8 bg-secondary/10 border-b">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black uppercase italic flex items-center gap-3">
                      <MapIcon className="h-6 w-6 text-primary" />
                      Informasi Kontak & Lokasi
                    </CardTitle>
                    <CardDescription>Atur alamat, jam operasional, dan peta lokasi yang tampil di Landing Page.</CardDescription>
                  </div>
                  <Button onClick={handleSaveWorkshop} disabled={loading} className="rounded-xl font-bold uppercase text-[10px] gap-2">
                    <Save className="h-4 w-4" /> SIMPAN KONTAK
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                        <Type className="h-3 w-3" /> Nama Bisnis (Tampil di Judul)
                      </Label>
                      <Input 
                        value={workshopData.businessName} 
                        onChange={e => setWorkshopData({...workshopData, businessName: e.target.value})} 
                        placeholder="Contoh: KARGLOSS" 
                        className="h-12 rounded-xl bg-secondary/5 font-black uppercase italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                        <Mail className="h-3 w-3" /> Email Resmi
                      </Label>
                      <Input 
                        value={workshopData.email} 
                        onChange={e => setWorkshopData({...workshopData, email: e.target.value})} 
                        placeholder="info@bisnis.id" 
                        className="h-12 rounded-xl bg-secondary/5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Deskripsi Pendaftaran</Label>
                      <Textarea 
                        value={workshopData.bookingDescription} 
                        onChange={e => setWorkshopData({...workshopData, bookingDescription: e.target.value})} 
                        placeholder="Teks ajakan booking..." 
                        className="h-32 rounded-xl bg-secondary/5 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Alamat Workshop</Label>
                      <Textarea 
                        value={workshopData.address} 
                        onChange={e => setWorkshopData({...workshopData, address: e.target.value})} 
                        placeholder="Alamat lengkap..." 
                        className="h-24 rounded-xl bg-secondary/5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Jam Operasional</Label>
                      <Input 
                        value={workshopData.operationHours} 
                        onChange={e => setWorkshopData({...workshopData, operationHours: e.target.value})} 
                        placeholder="Contoh: Senin - Minggu: 08:00 - 17:00 WIB" 
                        className="h-12 rounded-xl bg-secondary/5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Nomor WhatsApp / Kontak</Label>
                      <Input 
                        value={workshopData.phone} 
                        onChange={e => {
                          let val = e.target.value;
                          // Auto-convert 08xxx to +62 format for consistency
                          if (val.startsWith('0') && /^\d+$/.test(val)) {
                            val = `+62 ${val.substring(1)}`;
                          }
                          setWorkshopData({...workshopData, phone: val});
                        }} 
                        placeholder="Contoh: +62 811-2612-237" 
                        className="h-12 rounded-xl bg-secondary/5"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-dashed">
                  {/* Left Column: YouTube */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                        <Youtube className="h-3 w-3" /> Link YouTube Channel / Video
                      </Label>
                      <Input 
                        value={workshopData.youtubeLink} 
                        onChange={e => setWorkshopData({...workshopData, youtubeLink: e.target.value})} 
                        placeholder="https://www.youtube.com/watch?v=..." 
                        className="h-12 rounded-xl bg-secondary/5"
                      />
                      <p className="text-[9px] text-muted-foreground italic">
                        Tip: Masukkan link **Video spesifik** jika ingin menyematkan player video di landing page. Link Channel hanya akan menampilkan kartu ajakan subscribe.
                      </p>
                    </div>
                    
                    {/* YouTube Preview */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Pratinjau YouTube</Label>
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border bg-black shadow-lg">
                        {youtubePreview.type === 'video' ? (
                          <iframe 
                            src={youtubePreview.url}
                            className="w-full h-full border-none"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-secondary/10">
                            <Youtube className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Detected as Channel / Non-Video Link</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Google Maps */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Google Maps Embed Link</Label>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-primary underline">Cara ambil link?</a>
                      </div>
                      <Input 
                        value={workshopData.mapsUrl} 
                        onChange={e => setWorkshopData({...workshopData, mapsUrl: e.target.value})} 
                        placeholder="URL dari iframe maps (https://www.google.com/maps/embed?...)" 
                        className="h-12 rounded-xl bg-secondary/5"
                      />
                    </div>

                    {/* Maps Preview */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Pratinjau Lokasi (Maps)</Label>
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border bg-secondary/10 shadow-lg">
                        <iframe 
                          src={workshopData.mapsUrl} 
                          width="100%" 
                          height="100%" 
                          style={{ border: 0 }} 
                          allowFullScreen={true} 
                          loading="lazy" 
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl rounded-[2.5rem] bg-black text-white p-10 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center relative z-10">
               <ShieldCheck className="h-8 w-8 text-secondary" />
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-2xl font-[900] italic uppercase leading-tight tracking-tighter">Sistem Mandiri</h3>
              <p className="text-sm opacity-70 leading-relaxed font-medium">Anda dapat menyesuaikan identitas visual workshop kapanpun tanpa perlu menyentuh kode program.</p>
            </div>
            <div className="pt-6 border-t border-white/10 relative z-10">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">Butuh bantuan?</p>
               <Button variant="ghost" className="w-full h-12 rounded-xl border border-white/20 text-white hover:bg-white/10 font-bold uppercase text-[10px]" asChild>
                 <a href="https://wa.me/+62895803501000" target="_blank" rel="noopener noreferrer">Kontak IT Support</a>
               </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Service Edit/Add Modal */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase text-primary">
              {editingService ? "Edit Layanan" : "Tambah Layanan Baru"}
            </DialogTitle>
            <DialogDescription>Kelola detail kartu layanan yang tampil di halaman depan.</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Judul Layanan</Label>
                <Input 
                  value={serviceFormData.name} 
                  onChange={e => setServiceFormData({...serviceFormData, name: e.target.value})} 
                  placeholder="Contoh: Nano Ceramic Coating" 
                  className="h-12 rounded-xl" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Detail Layanan Singkat</Label>
                <Textarea 
                  value={serviceFormData.description} 
                  onChange={e => setServiceFormData({...serviceFormData, description: e.target.value})} 
                  placeholder="Penjelasan singkat layanan..." 
                  className="h-24 rounded-xl resize-none" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Harga Standar (Rp)</Label>
                <div className="relative">
                  <Input 
                    type="text"
                    value={serviceFormData.price ? new Intl.NumberFormat('id-ID').format(parseInt(serviceFormData.price.toString().replace(/\D/g, ""))) : ""}
                    onChange={e => setServiceFormData({...serviceFormData, price: e.target.value.replace(/\D/g, "")})}
                    placeholder="500.000" 
                    className="h-12 rounded-xl pl-10" 
                  />
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">URL Gambar Kartu</Label>
                <Input 
                  value={serviceFormData.imageUrl} 
                  onChange={e => setServiceFormData({...serviceFormData, imageUrl: e.target.value})} 
                  placeholder="https://... (URL Foto Layanan)" 
                  className="h-12 rounded-xl" 
                />
              </div>
              <div className="relative aspect-video rounded-xl bg-secondary/20 overflow-hidden border border-dashed flex items-center justify-center">
                {serviceFormData.imageUrl ? (
                  <Image src={serviceFormData.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                ) : (
                  <ImageIconLucide className="h-10 w-10 opacity-10" />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Icon Representasi</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ICON_OPTIONS.map((opt) => (
                    <Button 
                      key={opt.value} 
                      type="button"
                      variant={serviceFormData.icon === opt.value ? "default" : "outline"} 
                      className={`h-10 rounded-lg gap-2 text-[10px] font-bold uppercase transition-all ${serviceFormData.icon === opt.value ? 'bg-primary text-white shadow-md' : ''}`}
                      onClick={() => setServiceFormData({...serviceFormData, icon: opt.value})}
                    >
                      <opt.icon className="h-3 w-3" /> {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
            <Button variant="ghost" onClick={() => setIsServiceModalOpen(false)} className="rounded-xl uppercase font-bold text-xs">BATAL</Button>
            <Button onClick={handleSaveService} className="rounded-xl font-bold uppercase text-xs shadow-lg shadow-primary/20 px-8">SIMPAN LAYANAN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
