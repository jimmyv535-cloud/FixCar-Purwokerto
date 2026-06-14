
'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Edit2,
  X,
  Play,
  Send,
  Loader2,
  Bell
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, query, orderBy, getDocs, where } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { getEmbedUrl } from "@/lib/utils";
import { requestAndStoreFCMToken } from "@/firebase/messaging";

export default function PromoManagementPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isAdding, setIsAdding] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isActivatingAdmin, setIsActivatingAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    isActive: true
  });

  const promosQuery = useMemoFirebase(() => {
    return query(collection(db, "promos"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: promos, isLoading } = useCollection(promosQuery);

  const handleActivateAdminNotifications = async () => {
    if (!user) return;
    setIsActivatingAdmin(true);
    try {
      await requestAndStoreFCMToken(user.uid);
      toast({ title: "Notifikasi Admin Aktif", description: "Anda akan menerima konfirmasi broadcast berhasil." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal Mengaktifkan", description: err.message });
    } finally {
      setIsActivatingAdmin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast({ variant: "destructive", title: "Data Tidak Lengkap", description: "Judul dan URL Media wajib diisi." });
      return;
    }

    const promoRef = editingId ? doc(db, "promos", editingId) : doc(collection(db, "promos"));
    const isNewPromo = !editingId;
    
    const promoData = {
      ...formData,
      id: promoRef.id,
      createdAt: editingId ? (promos?.find(p => p.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    setDocumentNonBlocking(promoRef, promoData, { merge: true });
    
    if (isNewPromo && formData.isActive) {
      handleBroadcast(promoData);
    }

    toast({ title: editingId ? "Promo Diperbarui" : "Promo Ditambahkan" });
    resetForm();
  };

  const handleBroadcast = async (promoData: any) => {
    setIsBroadcasting(true);
    let successCount = 0;
    let failCount = 0;
    let lastError = "";

    try {
      // Mengambil semua member yang memiliki FCM token aktif
      const membersQuery = query(collection(db, "members"), where("fcmToken", "!=", null));
      const membersSnapshot = await getDocs(membersQuery);
      const totalTargets = membersSnapshot.size;

      if (totalTargets > 0) {
        for (const memberDoc of membersSnapshot.docs) {
          try {
            const memberId = memberDoc.id;
            const notificationRef = doc(collection(db, "members", memberId, "notifications"));
            
            // Logika Ambara: Menulis data notifikasi dengan status 'unread'
            setDocumentNonBlocking(notificationRef, {
              title: `PROMO: ${promoData.title}`,
              body: promoData.description,
              imageUrl: promoData.imageUrl,
              link: promoData.link || "/member/dashboard",
              createdAt: new Date().toISOString(),
              status: "unread",
              isRead: false,
              type: "promo"
            }, { merge: true });
            
            successCount++;
          } catch (e: any) {
            failCount++;
            lastError = e.message;
          }
        }

        // Mencatat Log Pengiriman (Untuk halaman Notifikasi Log)
        const logRef = doc(collection(db, "broadcastLogs"));
        setDocumentNonBlocking(logRef, {
          promoId: promoData.id,
          promoTitle: promoData.title,
          sentAt: new Date().toISOString(),
          targetCount: totalTargets,
          successCount,
          failCount,
          status: failCount === 0 ? "Success" : "Partial Success",
          error: lastError || null
        }, { merge: true });

        toast({
          title: "Broadcast Selesai",
          description: `Berhasil dikirim ke ${successCount} smartphone pelanggan.`,
        });
      } else {
        toast({ variant: "destructive", title: "Gagal Broadcast", description: "Belum ada member yang mengaktifkan notifikasi di smartphone mereka." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error Sistem", description: error.message });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", imageUrl: "", link: "", isActive: true });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (promo: any) => {
    setFormData({
      title: promo.title,
      description: promo.description || "",
      imageUrl: promo.imageUrl,
      link: promo.link || "",
      isActive: promo.isActive ?? true
    });
    setEditingId(promo.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Hapus banner promo "${title}"?`)) {
      deleteDocumentNonBlocking(doc(db, "promos", id));
      toast({ title: "Promo Dihapus" });
    }
  };

  const toggleStatus = (promo: any) => {
    const promoRef = doc(db, "promos", promo.id);
    const newStatus = !promo.isActive;
    setDocumentNonBlocking(promoRef, { ...promo, isActive: newStatus }, { merge: true });
    toast({ title: `Banner ${newStatus ? 'Aktif' : 'Non-Aktif'}` });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Banner Promo</h1>
          <p className="text-muted-foreground font-medium">Buat promo yang memicu pop-up notifikasi otomatis ke smartphone pelanggan.</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleActivateAdminNotifications}
            disabled={isActivatingAdmin}
            variant="outline"
            className="rounded-xl h-12 px-6 font-bold gap-2 border-primary/20"
          >
            {isActivatingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            AKTIFKAN NOTIFIKASI ADMIN
          </Button>
          <Button 
            onClick={() => { if(isAdding) resetForm(); else setIsAdding(true); }}
            className="rounded-xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20"
            variant={isAdding ? "destructive" : "default"}
          >
            {isAdding ? <><X className="h-5 w-5" /> BATAL</> : <><Plus className="h-5 w-5" /> TAMBAH BANNER</>}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden animate-fade-in">
          <CardHeader className="p-8 bg-primary/5">
            <CardTitle className="text-xl font-black uppercase italic">
              {editingId ? "Edit Banner Promo" : "Buat Banner & Kirim Notifikasi"}
            </CardTitle>
            <CardDescription>Smartphone pelanggan akan menampilkan banner promo ini segera setelah Anda menyimpannya.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Judul Promo (Tampil di Notifikasi)</Label>
                  <Input 
                    placeholder="Contoh: Diskon Ganti Oli 20%"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="h-12 bg-secondary/50 border-none rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL Media (YouTube/TikTok/Gambar)</Label>
                  <Input 
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="h-12 bg-secondary/50 border-none rounded-xl"
                  />
                </div>
              </div>

              {formData.imageUrl && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pratinjau</Label>
                  <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-secondary shadow-lg">
                    {getEmbedUrl(formData.imageUrl).type === 'video' ? (
                      <iframe 
                        src={getEmbedUrl(formData.imageUrl).url}
                        className="w-full h-full border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Isi Pesan Notifikasi</Label>
                <Input 
                  placeholder="Penjelasan singkat yang akan muncul di layar smartphone pelanggan..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="h-12 bg-secondary/50 border-none rounded-xl"
                />
              </div>

              <div className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-xl border border-border/50">
                <Switch 
                  id="promo-active" 
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="promo-active" className="text-sm font-bold uppercase tracking-tight">Status & Broadcast</Label>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Kirim notifikasi otomatis jika status Aktif saat disimpan.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Link WhatsApp (Opsional)</Label>
                  <Input 
                    placeholder="Contoh: 0812..."
                    value={formData.link}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.startsWith('0') && /^\d+$/.test(val)) val = `https://wa.me/62${val.substring(1)}`;
                      setFormData({...formData, link: val})
                    }}
                    className="h-12 bg-secondary/50 border-none rounded-xl"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={isBroadcasting} className="w-full h-14 rounded-xl font-black uppercase tracking-wider gap-2 shadow-xl shadow-primary/20">
                    {isBroadcasting ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> MENGIRIM BROADCAST...</>
                    ) : (
                      <><Send className="h-5 w-5" /> {editingId ? "PERBARUI BANNER" : "SIMPAN & BROADCAST"}</>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => <div key={i} className="h-64 bg-secondary/50 rounded-[2rem] animate-pulse" />)
        ) : promos && promos.length > 0 ? (
          promos.map((promo) => {
            const media = getEmbedUrl(promo.imageUrl);
            return (
              <Card key={promo.id} className={`border-none shadow-xl rounded-[2rem] group hover:shadow-2xl transition-all duration-300 bg-background overflow-hidden ${!promo.isActive ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                <div className="relative h-48 w-full bg-secondary">
                  {media.type === 'video' ? (
                    <div className="relative w-full h-full">
                      <iframe src={media.url} className="w-full h-full border-none" allowFullScreen allow="accelerometer; gyroscope" loading="lazy" />
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] text-white font-bold flex items-center gap-1"><Play className="h-2 w-2 fill-white" /> VIDEO</div>
                    </div>
                  ) : (
                    <Image src={promo.imageUrl || "https://picsum.photos/seed/promo/800/400"} alt={promo.title} fill className="object-cover" unoptimized />
                  )}
                  
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg shadow-lg" onClick={() => handleEdit(promo)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8 rounded-lg shadow-lg" onClick={() => handleDelete(promo.id, promo.title)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col min-w-0 mr-2">
                      <h3 className="text-lg font-black uppercase italic tracking-tight truncate">{promo.title}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{promo.isActive ? 'Aktif' : 'Non-Aktif'}</p>
                    </div>
                    <Switch checked={promo.isActive} onCheckedChange={() => toggleStatus(promo)} />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2">{promo.description || "Tidak ada deskripsi."}</p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-24 text-center space-y-4 bg-secondary/20 rounded-[3rem]">
            <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
            <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">Belum ada banner promo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
