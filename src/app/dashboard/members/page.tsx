
'use client';

import React, { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Car, 
  Loader2,
  Edit2,
  Trash2,
  X,
  Wrench,
  PlusCircle,
  CreditCard,
  Download,
  Upload,
  CalendarDays,
  ExternalLink
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, query, where, orderBy } from "firebase/firestore";
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseConfig } from "@/firebase/config";
import * as XLSX from 'xlsx';
import { format } from "date-fns";

export default function MembersManagementPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isOwner = user?.email === 'owner.kargloss@gmail.com';

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    carModel: "",
    plateNumber: ""
  });

  // Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  
  const [serviceData, setServiceData] = useState({
    serviceType: "",
    description: "",
    totalCost: "",
    status: "Selesai"
  });

  const [scheduleData, setScheduleData] = useState({
    date: "",
    time: "09:00",
    serviceType: "Servis Berkala",
    notes: ""
  });

  const membersQuery = useMemoFirebase(() => {
    return collection(db, "members");
  }, [db]);

  const { data: members, isLoading: isDataLoading } = useCollection(membersQuery);

  const filteredAndSortedMembers = useMemo(() => {
    if (!members) return [];
    
    return members
      .filter(m => {
        const name = (m.fullName || "").toLowerCase();
        const email = (m.email || "").toLowerCase();
        const phone = (m.phone || "");
        const plate = (m.plateNumber || "").toLowerCase();
        const searchTerm = search.toLowerCase();

        return name.includes(searchTerm) || 
               email.includes(searchTerm) || 
               phone.includes(search) ||
               plate.includes(searchTerm);
      })
      .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
  }, [members, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || formData.fullName.trim() === "") {
      toast({ variant: "destructive", title: "Nama Wajib Diisi" });
      return;
    }
    if (!formData.email || formData.email.trim() === "") {
      toast({ variant: "destructive", title: "Email Wajib Diisi" });
      return;
    }
    if (!formData.phone || formData.phone.trim() === "") {
      toast({ variant: "destructive", title: "Nomor WA Wajib Diisi" });
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.phone.replace(/\D/g, '');

    if (editingId) {
      setIsLoading(true);
      const memberRef = doc(db, "members", editingId);
      updateDocumentNonBlocking(memberRef, {
        ...formData,
        fullName: formData.fullName.trim(),
        email: cleanEmail,
        phone: formData.phone.trim()
      });
      toast({ title: "Data Diperbarui" });
      resetForm();
      setIsLoading(false);
    } else {
      setIsLoading(true);
      
      const isExist = members?.some(m => m.email?.toLowerCase() === cleanEmail);
      if (isExist) {
        toast({ variant: "destructive", title: "Email Sudah Terdaftar" });
        setIsLoading(false);
        return;
      }

      let secondaryApp;
      try {
        const appName = `member-gen-${Date.now()}`;
        secondaryApp = initializeApp(firebaseConfig, appName);
        const secondaryAuth = getAuth(secondaryApp);

        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth, 
          cleanEmail, 
          cleanPassword
        );
        
        const uid = userCredential.user.uid;
        await signOut(secondaryAuth);
        await deleteApp(secondaryApp);

        const memberRef = doc(db, "members", uid);
        const newMember = {
          ...formData,
          fullName: formData.fullName.trim(),
          email: cleanEmail,
          id: uid,
          joinedAt: new Date().toISOString()
        };

        setDocumentNonBlocking(memberRef, newMember, { merge: true });
        toast({ title: "Member Berhasil Didaftarkan" });
        resetForm();
      } catch (error: any) {
        toast({ variant: "destructive", title: "Registrasi Gagal", description: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ fullName: "", email: "", phone: "", carModel: "", plateNumber: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (member: any) => {
    setEditingId(member.id);
    setFormData({
      fullName: member.fullName || "",
      email: member.email || "",
      phone: member.phone || "",
      carModel: member.carModel || "",
      plateNumber: member.plateNumber || ""
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus member ${name}?`)) {
      deleteDocumentNonBlocking(doc(db, "members", id));
      toast({ title: "Member Dihapus" });
    }
  };

  const openServiceModal = (member: any) => {
    setSelectedMember(member);
    setServiceData({ serviceType: "", description: "", totalCost: "", status: "Selesai" });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = () => {
    if (!serviceData.serviceType.trim() || !serviceData.totalCost) {
      toast({ variant: "destructive", title: "Data Tidak Lengkap" });
      return;
    }

    addDocumentNonBlocking(collection(db, "serviceOrders"), {
      memberId: selectedMember.id,
      customerName: selectedMember.fullName || "Pelanggan",
      carModel: selectedMember.carModel || "Unknown",
      serviceType: serviceData.serviceType.trim(),
      description: serviceData.description.trim(),
      totalCost: parseInt(serviceData.totalCost),
      status: serviceData.status,
      createdAt: new Date().toISOString()
    });
    
    toast({ title: "Riwayat Servis Dicatat" });
    setIsServiceModalOpen(false);
  };

  // Service Schedule Logic
  const openScheduleModal = (member: any) => {
    setSelectedMember(member);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleData({
      date: format(tomorrow, 'yyyy-MM-dd'),
      time: "09:00",
      serviceType: "Servis Berkala",
      notes: `Booking servis untuk unit ${member.carModel || 'Mobil'} (${member.plateNumber || '-'})`
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = () => {
    if (!scheduleData.date || !scheduleData.time) {
      toast({ variant: "destructive", title: "Tanggal dan Waktu wajib diisi." });
      return;
    }

    const appointmentDateTime = `${scheduleData.date}T${scheduleData.time}:00`;
    
    // 1. Simpan ke Firestore
    addDocumentNonBlocking(collection(db, "serviceSchedules"), {
      memberId: selectedMember.id,
      customerName: selectedMember.fullName,
      serviceType: scheduleData.serviceType,
      appointmentDate: appointmentDateTime,
      notes: scheduleData.notes,
      status: "scheduled",
      createdAt: new Date().toISOString()
    });

    // 2. Simpan ke Antrean Email (Trigger Email Extension)
    addDocumentNonBlocking(collection(db, "mail"), {
      to: [selectedMember.email],
      message: {
        subject: `Konfirmasi Jadwal Servis - Kargloss Autocare`,
        html: `Halo ${selectedMember.fullName},<br><br>Kendaraan Anda (${selectedMember.carModel}) telah dijadwalkan untuk <b>${scheduleData.serviceType}</b> pada:<br><br>Tanggal: <b>${format(new Date(appointmentDateTime), 'dd MMMM yyyy')}</b><br>Jam: <b>${scheduleData.time} WIB</b><br><br>Mohon datang tepat waktu. Terima kasih.<br><br>Salam,<br>Kargloss Autocare`,
      }
    });

    toast({ title: "Jadwal Berhasil Dibuat", description: "Email konfirmasi telah dikirim ke pelanggan." });
    setIsScheduleModalOpen(false);
  };

  const getGoogleCalendarLink = () => {
    if (!selectedMember || !scheduleData.date) return "#";
    const start = `${scheduleData.date.replace(/-/g, '')}T${scheduleData.time.replace(/:/g, '')}00`;
    const end = `${scheduleData.date.replace(/-/g, '')}T${(parseInt(scheduleData.time.split(':')[0]) + 1).toString().padStart(2, '0')}${scheduleData.time.split(':')[1]}00`;
    
    const title = encodeURIComponent(`Servis: ${selectedMember.fullName} (${selectedMember.carModel || 'Unit'})`);
    const details = encodeURIComponent(`${scheduleData.serviceType}\nNotes: ${scheduleData.notes}\nWA: ${selectedMember.phone}`);
    const location = encodeURIComponent("Kargloss Autocare Purwokerto Utara");

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  const handleExportExcel = () => {
    if (filteredAndSortedMembers.length === 0) return;
    const exportData = filteredAndSortedMembers.map(m => ({
      "Nama Lengkap": m.fullName || "",
      "Email": m.email || "",
      "WhatsApp": m.phone || "",
      "Mobil": m.carModel || "",
      "Plat Nomor": m.plateNumber || "",
      "Tanggal Gabung": m.joinedAt ? format(new Date(m.joinedAt), 'dd/MM/yyyy') : ""
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Member");
    XLSX.writeFile(workbook, `Kargloss_Members_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Manajemen Member</h1>
          <p className="text-muted-foreground font-medium">Kelola akun, riwayat servis, dan jadwal pengingat pelanggan.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {isOwner && (
            <>
              <input type="file" ref={fileInputRef} onChange={() => {}} accept=".xlsx, .xls" className="hidden" />
              <Button onClick={() => fileInputRef.current?.click()} disabled={isImporting} variant="outline" className="rounded-xl h-12 gap-2 border-primary/20 font-bold uppercase text-[10px]">
                <Upload className="h-4 w-4" /> IMPOR EXCEL
              </Button>
              <Button onClick={handleExportExcel} className="rounded-xl h-12 gap-2 bg-[#00B14F] hover:bg-[#009241] text-white font-bold uppercase text-[10px] px-6">
                <Download className="h-4 w-4" /> EKSPOR EXCEL
              </Button>
            </>
          )}
          <Button onClick={() => isAdding ? resetForm() : setIsAdding(true)} className="rounded-xl h-12 gap-2 shadow-lg shadow-primary/20 font-bold uppercase text-[10px]" variant={isAdding ? "outline" : "default"} disabled={isLoading}>
            {isAdding ? <><X className="h-5 w-5" /> BATALKAN</> : <><UserPlus className="h-5 w-5" /> MEMBER BARU</>}
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari nama, WA, atau plat nomor..." className="pl-12 h-12 rounded-xl bg-background border-none shadow-xl shadow-primary/5 font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isAdding && (
        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden animate-fade-in">
          <CardHeader className="p-8 bg-primary/5 border-b border-dashed border-primary/10">
            <CardTitle className="text-xl font-black uppercase italic flex items-center gap-3">
               <CreditCard className="h-6 w-6 text-primary" />
               {editingId ? "Edit Profil Member" : "Registrasi Member"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="member-fullname" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Nama Lengkap *</Label>
                <Input id="member-fullname" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Budi Santoso" required className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-email" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Email *</Label>
                <Input id="member-email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="budi@email.com" required className="h-12 bg-secondary/30 border-none rounded-xl font-bold" disabled={!!editingId} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-phone" className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Nomor WhatsApp *</Label>
                <Input id="member-phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0812..." required className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Mobil & Nopol</Label>
                <div className="grid grid-cols-2 gap-2">
                   <Input id="member-car" value={formData.carModel} onChange={e => setFormData({...formData, carModel: e.target.value})} placeholder="Avanza" className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
                   <Input id="member-plate" value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value.toUpperCase()})} placeholder="R 1234 AB" className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
                </div>
              </div>
              <div className="flex items-end pt-2">
                <Button type="submit" className="w-full h-12 rounded-xl font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "SIMPAN PERUBAHAN" : "AKTIFKAN AKUN MEMBER"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isDataLoading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-secondary/50 rounded-3xl animate-pulse" />)
        ) : filteredAndSortedMembers.map((member) => (
          <Card key={member.id} className="border-none shadow-lg rounded-3xl group hover:shadow-2xl transition-all duration-300 bg-background overflow-hidden border border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="flex items-center gap-4 w-full lg:w-1/4">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shrink-0">
                    {(member.fullName || "M").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black uppercase text-base sm:text-lg truncate">{member.fullName || "Tanpa Nama"}</h3>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1">Status: AKTIF</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 w-full lg:flex-1 border-t lg:border-t-0 lg:border-l border-dashed border-border/50 pt-4 lg:pt-0 lg:pl-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Kontak</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-bold"><Phone className="h-3.5 w-3.5 text-primary" />{member.phone || "-"}</div>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Mail className="h-3.5 w-3.5 opacity-50" />{member.email || "-"}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Kendaraan</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-bold uppercase italic text-primary"><Car className="h-3.5 w-3.5" />{member.carModel || 'BELUM DIISI'}</div>
                      <div className="flex items-center gap-2"><span className="bg-secondary/20 text-primary px-3 py-0.5 rounded-lg font-black text-[10px] border border-primary/10">{member.plateNumber || 'TIDAK ADA NOPOL'}</span></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 lg:border-l border-dashed border-border/50 lg:pl-8">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 w-full">
                    <Button onClick={() => openServiceModal(member)} className="h-10 px-4 rounded-xl font-black uppercase text-[9px] gap-2 tracking-widest bg-secondary text-primary hover:bg-primary hover:text-white border-none">
                      <PlusCircle className="h-4 w-4" /> INPUT SERVIS
                    </Button>
                    <Button onClick={() => openScheduleModal(member)} variant="outline" className="h-10 px-4 rounded-xl font-black uppercase text-[9px] gap-2 tracking-widest border-primary/20 text-primary hover:bg-primary hover:text-white">
                      <CalendarDays className="h-4 w-4" /> JADWALKAN
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleEdit(member)}><Edit2 className="h-4 w-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive" onClick={() => handleDelete(member.id, member.fullName)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Service Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="rounded-[2rem] max-w-md border-none shadow-3xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-black italic uppercase text-primary flex items-center gap-3">
              <CalendarDays className="h-6 w-6" /> Buat Jadwal Servis
            </DialogTitle>
            <DialogDescription className="font-medium text-sm">
              Tentukan jadwal servis berkala untuk <span className="text-foreground font-black uppercase underline">{selectedMember?.fullName}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Tanggal Servis</Label>
                <Input type="date" value={scheduleData.date} onChange={e => setScheduleData({...scheduleData, date: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Jam Kedatangan</Label>
                <Input type="time" value={scheduleData.time} onChange={e => setScheduleData({...scheduleData, time: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Jenis Layanan</Label>
              <Input value={scheduleData.serviceType} onChange={e => setScheduleData({...scheduleData, serviceType: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Catatan Internal</Label>
              <Textarea value={scheduleData.notes} onChange={e => setScheduleData({...scheduleData, notes: e.target.value})} className="bg-secondary/30 border-none rounded-xl min-h-[80px]" />
            </div>
            
            <Button asChild variant="outline" className="w-full h-12 rounded-xl border-dashed border-primary/20 text-primary hover:bg-secondary/50 font-bold uppercase text-[10px] gap-2">
              <a href={getGoogleCalendarLink()} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> SIMPAN KE GOOGLE CALENDAR ADMIN
              </a>
            </Button>
          </div>
          <DialogFooter className="gap-2 pt-4 border-t border-dashed">
            <Button variant="ghost" onClick={() => setIsScheduleModalOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">BATAL</Button>
            <Button onClick={handleSaveSchedule} className="rounded-xl font-black uppercase text-[10px] px-8 shadow-xl bg-primary text-white">SIMPAN & KIRIM EMAIL</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Existing History Modal */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="rounded-[2rem] max-w-lg border-none shadow-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase text-primary flex items-center gap-3"><Wrench className="h-6 w-6" /> Catat Riwayat Servis</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Jenis Layanan</Label>
              <Input placeholder="Contoh: Ganti Oli" value={serviceData.serviceType} onChange={e => setServiceData({...serviceData, serviceType: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Biaya (Rp)</Label>
                <Input type="number" placeholder="500000" value={serviceData.totalCost} onChange={e => setServiceData({...serviceData, totalCost: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-black text-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Status</Label>
                <Select value={serviceData.status} onValueChange={v => setServiceData({...serviceData, status: v})}>
                  <SelectTrigger className="h-12 bg-secondary/30 border-none rounded-xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Selesai" className="font-bold uppercase text-[10px]">SELESAI</SelectItem>
                    <SelectItem value="Proses" className="font-bold uppercase text-[10px]">PROSES</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4 border-t border-dashed">
            <Button variant="ghost" onClick={() => setIsServiceModalOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">BATAL</Button>
            <Button onClick={handleSaveService} className="rounded-xl font-black uppercase text-[10px] px-8 shadow-xl">SIMPAN RIWAYAT</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
