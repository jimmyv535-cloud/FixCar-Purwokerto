
'use client';

import React, { useState, useMemo, useRef } from "react";
import { 
  Users, 
  Plus, 
  CheckCircle2, 
  Ban, 
  Play, 
  UserPlus,
  Clock,
  Search,
  Monitor,
  Volume2,
  FileText,
  Calendar as CalendarIcon,
  Download,
  Filter,
  TrendingUp,
  LayoutGrid,
  Printer,
  Edit2,
  Trash2,
  Save,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, doc, limit } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import Image from "next/image";

const SLOTS = ["Slot A", "Slot B", "Slot C", "Slot D"];

export default function QueueManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [searchMember, setSearchMember] = useState("");
  const [printingEntry, setPrintingEntry] = useState<any>(null);
  
  // State Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  
  // State Laporan
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [formData, setFormData] = useState({
    customerName: "",
    plateNumber: "",
    serviceType: "Cuci Mobil Premium",
    memberId: null as string | null,
    isMember: false
  });

  // Query Dynamic Services
  const servicesQuery = useMemoFirebase(() => query(collection(db, "services"), orderBy("name", "asc")), [db]);
  const { data: services } = useCollection(servicesQuery);

  // Query Antrian Aktif
  const activeQueueQuery = useMemoFirebase(() => {
    return query(
      collection(db, "queueEntries"), 
      where("status", "in", ["waiting", "calling", "washing"]),
      orderBy("createdAt", "asc")
    );
  }, [db]);

  const membersQuery = useMemoFirebase(() => {
    return collection(db, "members");
  }, [db]);

  const reportsQuery = useMemoFirebase(() => {
    return query(collection(db, "serviceOrders"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: queue, isLoading: isQueueLoading } = useCollection(activeQueueQuery);
  const { data: members } = useCollection(membersQuery);
  const { data: allServices, isLoading: isReportsLoading } = useCollection(reportsQuery);

  const filteredMembers = useMemo(() => {
    if (!searchMember) return [];
    return members?.filter(m => 
      m.fullName.toLowerCase().includes(searchMember.toLowerCase()) || 
      m.phone.includes(searchMember)
    ).slice(0, 5);
  }, [members, searchMember]);

  const reportData = useMemo(() => {
    if (!allServices) return [];
    return allServices.filter(item => {
      const itemDate = parseISO(item.createdAt);
      return isWithinInterval(itemDate, {
        start: startOfDay(parseISO(startDate)),
        end: endOfDay(parseISO(endDate))
      });
    });
  }, [allServices, startDate, endDate]);

  const handleAddQueue = () => {
    if (!formData.customerName) {
      toast({ variant: "destructive", title: "Nama Pelanggan wajib diisi." });
      return;
    }

    const nextNumber = (queue?.length || 0) + 1;
    const newEntry = {
      ...formData,
      queueNumber: nextNumber,
      status: "waiting",
      createdAt: new Date().toISOString(),
      calledAt: null,
      slot: null
    };

    addDocumentNonBlocking(collection(db, "queueEntries"), newEntry);
    toast({ title: "Antrian Ditambahkan", description: `Nomor Antrian: ${nextNumber}` });
    
    // Auto-prepare for printing if needed
    setPrintingEntry(newEntry);
    
    setIsAdding(false);
    setFormData({ customerName: "", plateNumber: "", serviceType: services?.[0]?.name || "Cuci Mobil Premium", memberId: null, isMember: false });
    setSearchMember("");
  };

  const updateStatus = (id: string, status: string, slot?: string) => {
    const docRef = doc(db, "queueEntries", id);
    const updates: any = { status };
    if (status === "washing" || status === "calling") {
      updates.calledAt = new Date().toISOString();
      if (slot) updates.slot = slot;
    }
    updateDocumentNonBlocking(docRef, updates);
    toast({ title: "Status Diperbarui" });
  };

  const startEditWaiting = (item: any) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const saveEditWaiting = () => {
    if (!editingId || !editData) return;
    updateDocumentNonBlocking(doc(db, "queueEntries", editingId), editData);
    setEditingId(null);
    setEditData(null);
    toast({ title: "Antrian Diperbarui" });
  };

  const cancelQueueEntry = (item: any) => {
    const reason = prompt(`Alasan pembatalan antrian #${item.queueNumber} (${item.customerName}):`);
    if (reason === null) return; // User cancelled the prompt

    const docRef = doc(db, "queueEntries", item.id);
    updateDocumentNonBlocking(docRef, { 
      status: "cancelled", 
      cancelReason: reason || "Tanpa alasan",
      cancelledAt: new Date().toISOString()
    });
    
    toast({ title: "Antrian Dibatalkan", description: "Data tetap tersimpan di riwayat pembatalan." });
  };

  const handlePrint = (item: any) => {
    setPrintingEntry(item);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const exportToExcel = () => {
    if (reportData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(reportData.map(item => ({
      Tanggal: format(parseISO(item.createdAt), 'dd/MM/yyyy HH:mm'),
      Pelanggan: item.customerName,
      Mobil: item.carModel,
      Layanan: item.serviceType,
      Biaya: item.totalCost,
      Status: item.status
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Layanan");
    XLSX.writeFile(workbook, `Laporan_Kargloss_${startDate}_to_${endDate}.xlsx`);
  };

  return (
    <div className="space-y-10 pb-20 print:p-0">
      {/* Printable Ticket Area - Hidden on Screen */}
      <div className="hidden print:block print:w-[58mm] print:mx-auto print:bg-white print:text-black print:p-2 text-center font-mono">
        {printingEntry && (
          <div className="space-y-4">
             <div className="flex justify-center mb-2">
                <Image 
                  src="https://i.imgur.com/eoWaIfA.jpeg"
                  alt="Kargloss"
                  width={120}
                  height={40}
                  className="object-contain"
                />
             </div>
             <div className="border-t border-b border-black py-1 text-[10px] font-bold uppercase">
               Kargloss Autocare Purwokerto
             </div>
             <div className="py-2">
               <p className="text-[10px] uppercase font-bold">Nomor Antrian</p>
               <h1 className="text-6xl font-black">{printingEntry.queueNumber}</h1>
             </div>
             <div className="space-y-1 text-[10px] text-left">
               <div className="flex justify-between">
                 <span>Nama:</span>
                 <span className="font-bold truncate max-w-[100px]">{printingEntry.customerName}</span>
               </div>
               <div className="flex justify-between">
                 <span>Unit:</span>
                 <span className="font-bold">{printingEntry.plateNumber || '-'}</span>
               </div>
               <div className="flex justify-between">
                 <span>Layanan:</span>
                 <span className="font-bold">{printingEntry.serviceType}</span>
               </div>
             </div>
             <div className="border-t border-black pt-2 text-[8px] font-medium italic">
               <p>{format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
               <p className="mt-2 not-italic font-bold">Terima kasih atas kunjungan Anda</p>
             </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Monitor Workshop</h1>
          <p className="text-muted-foreground font-medium">Manajemen 4 Slot Pengerjaan dan Antrian Real-time.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-12 gap-2 font-bold" onClick={() => window.open('/display', '_blank')}>
            <Monitor className="h-5 w-5" /> LAYAR DISPLAY
          </Button>
          <Button onClick={() => setIsAdding(true)} className="rounded-xl h-12 gap-2 shadow-lg shadow-primary/20 font-bold">
            <UserPlus className="h-5 w-5" /> ANTRIAN BARU
          </Button>
        </div>
      </div>

      <Tabs defaultValue="monitor" className="w-full print:hidden">
        <TabsList className="bg-secondary/20 p-1 rounded-2xl h-14 mb-8">
          <TabsTrigger value="monitor" className="rounded-xl px-8 font-black uppercase italic text-xs gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Monitor className="h-4 w-4" /> MONITOR AKTIF
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-xl px-8 font-black uppercase italic text-xs gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <FileText className="h-4 w-4" /> LAPORAN LAYANAN
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-8 animate-in fade-in duration-500">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SLOTS.map(slotName => {
                  const active = queue?.find(q => q.slot === slotName && (q.status === "washing" || q.status === "calling"));
                  return (
                    <Card key={slotName} className={`border-none shadow-xl rounded-[2rem] overflow-hidden ${active ? 'ring-2 ring-primary bg-background' : 'bg-secondary/10 opacity-60'}`}>
                      <CardHeader className="p-6 border-b bg-secondary/20">
                        <CardTitle className="text-lg font-black uppercase tracking-widest flex justify-between">
                          {slotName}
                          {active && <Badge className="bg-primary text-white text-[9px]">DIKERJAKAN</Badge>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 text-center space-y-4">
                        {active ? (
                          <>
                            <div className="text-6xl font-black text-primary">#{active.queueNumber}</div>
                            <div className="space-y-1">
                              <p className="font-black uppercase text-sm">{active.customerName}</p>
                              <p className="text-xs font-bold text-muted-foreground">{active.plateNumber || 'TIDAK ADA NOPOL'}</p>
                              <p className="text-[10px] font-black uppercase text-primary/60">{active.serviceType}</p>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button variant="outline" onClick={() => updateStatus(active.id, "washing", slotName)} className="flex-1 rounded-xl border-primary text-primary font-bold h-12">RECALL</Button>
                              <Button 
                                onClick={() => {
                                  if (confirm(`Selesaikan antrian #${active.queueNumber} (${active.customerName})?`)) {
                                    updateStatus(active.id, "completed");
                                  }
                                }} 
                                className="flex-1 rounded-xl bg-green-500 hover:bg-green-600 font-bold h-12 text-white"
                              >
                                SELESAI
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="py-12 space-y-4"><Clock className="h-10 w-10 mx-auto opacity-20" /><p className="text-xs font-bold uppercase opacity-40">Slot Kosong</p></div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="space-y-6 pt-6">
                <h2 className="text-xl font-black uppercase italic flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Daftar Tunggu</h2>
                <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {queue?.filter(q => q.status === "waiting").map((item) => (
                        <div key={item.id} className="p-6 flex items-center justify-between hover:bg-secondary/5 transition-colors">
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                            <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0">{item.queueNumber}</div>
                            
                            {editingId === item.id ? (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                <Input 
                                  value={editData.customerName} 
                                  onChange={e => setEditData({...editData, customerName: e.target.value})} 
                                  className="h-9 rounded-lg text-xs font-bold uppercase"
                                  placeholder="Nama"
                                />
                                <Input 
                                  value={editData.plateNumber} 
                                  onChange={e => setEditData({...editData, plateNumber: e.target.value.toUpperCase()})} 
                                  className="h-9 rounded-lg text-xs font-bold uppercase"
                                  placeholder="Nopol"
                                />
                                <Select value={editData.serviceType} onValueChange={v => setEditData({...editData, serviceType: v})}>
                                  <SelectTrigger className="h-9 rounded-lg text-xs font-bold uppercase">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {services?.map(s => <SelectItem key={s.id} value={s.name} className="text-xs font-bold uppercase">{s.name}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              <div className="min-w-0">
                                <p className="font-black uppercase text-sm truncate">{item.customerName}{item.isMember && <Badge variant="secondary" className="text-[8px] h-4 ml-2">MEMBER</Badge>}</p>
                                <p className="text-xs font-bold text-muted-foreground truncate">{item.plateNumber || 'Tanpa Nopol'} • {item.serviceType}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 sm:gap-4 ml-4">
                            {editingId === item.id ? (
                              <>
                                <Button size="icon" variant="ghost" className="h-9 w-9 text-green-600" onClick={saveEditWaiting}><Save className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                              </>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" className="h-9 w-9 opacity-40 hover:opacity-100" onClick={() => startEditWaiting(item)}><Edit2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive opacity-40 hover:opacity-100" onClick={() => cancelQueueEntry(item)}><Trash2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handlePrint(item)}><Printer className="h-4 w-4" /></Button>
                                <Select onValueChange={(v) => updateStatus(item.id, "washing", v)}>
                                  <SelectTrigger className="w-28 sm:w-40 h-10 rounded-xl font-black text-[9px] sm:text-[10px] uppercase"><SelectValue placeholder="PANGGIL KE..." /></SelectTrigger>
                                  <SelectContent className="rounded-xl font-bold">{SLOTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!queue || queue.filter(q => q.status === "waiting").length === 0) && (
                        <div className="py-12 text-center text-muted-foreground font-bold uppercase text-xs opacity-30">Belum ada antrian menunggu</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              {isAdding ? (
                <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden sticky top-24">
                  <CardHeader className="p-8 bg-primary text-white">
                    <CardTitle className="text-xl font-black uppercase italic">Registrasi Antrian</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase opacity-50">Cari Member</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                          <Input placeholder="Nama atau WA..." value={searchMember} onChange={(e) => setSearchMember(e.target.value)} className="pl-10 h-12 bg-secondary/50 border-none rounded-xl" />
                        </div>
                        {filteredMembers.length > 0 && (
                          <div className="mt-2 border rounded-xl overflow-hidden divide-y bg-background shadow-lg">
                            {filteredMembers.map(m => (
                              <button key={m.id} className="w-full p-3 text-left hover:bg-secondary/10 flex justify-between" onClick={() => { setFormData({ ...formData, customerName: m.fullName, plateNumber: m.plateNumber || "", memberId: m.id, isMember: true }); setSearchMember(""); }}>
                                <span className="font-bold text-xs">{m.fullName}</span>
                                <span className="text-[9px] opacity-50">{m.phone}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase opacity-50">Nama Pelanggan</Label>
                        <Input value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="h-12 bg-secondary/50 border-none rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase opacity-50">Plat Nomor (Nopol)</Label>
                        <Input value={formData.plateNumber} onChange={(e) => setFormData({...formData, plateNumber: e.target.value.toUpperCase()})} placeholder="R 1234 AB" className="h-12 bg-secondary/50 border-none rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase opacity-50">Layanan</Label>
                        <Select value={formData.serviceType} onValueChange={(v) => setFormData({...formData, serviceType: v})}>
                          <SelectTrigger className="h-12 bg-secondary/50 border-none rounded-xl font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl font-bold">
                            {services?.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                            {(!services || services.length === 0) && <SelectItem value="Cuci Mobil Premium">Cuci Mobil Premium</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setIsAdding(false)} className="flex-1 h-12 rounded-xl">BATAL</Button>
                      <Button onClick={handleAddQueue} className="flex-2 h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest px-8">SUBMIT</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-none shadow-xl rounded-[2rem] bg-secondary p-8 text-primary h-fit">
                   <div className="flex items-center gap-3 mb-6">
                      <LayoutGrid className="h-5 w-5" />
                      <h3 className="font-black uppercase italic text-xl">Statistik</h3>
                   </div>
                   <div className="space-y-4">
                      <div className="bg-background/50 p-4 rounded-2xl flex justify-between items-center">
                         <span className="text-[10px] font-black uppercase opacity-60">Total Antrian</span>
                         <span className="text-2xl font-black">{queue?.length || 0}</span>
                      </div>
                   </div>
                   <Button variant="outline" className="w-full mt-6 h-12 rounded-xl border-primary text-primary font-black uppercase text-[10px]" onClick={() => window.open('/display', '_blank')}>Buka Display</Button>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-8 animate-in fade-in duration-500">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 bg-secondary/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                 <FileText className="h-7 w-7 text-primary" />
                 <div><CardTitle className="text-2xl font-black italic uppercase">Rekap Data Layanan</CardTitle></div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-background p-2 rounded-xl shadow-sm border">
                   <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border-none bg-transparent h-8 w-36 font-bold" />
                   <span className="font-black text-[10px] px-2">S/D</span>
                   <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border-none bg-transparent h-8 w-36 font-bold" />
                </div>
                <Button onClick={exportToExcel} className="h-12 rounded-xl bg-[#00B14F] hover:bg-[#009241] text-white gap-2 font-black uppercase text-[10px] px-6"><Download className="h-4 w-4" /> EKSPOR EXCEL</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                 <TableHeader className="bg-secondary/10">
                   <TableRow><TableHead>Waktu</TableHead><TableHead>Pelanggan</TableHead><TableHead>Unit</TableHead><TableHead>Layanan</TableHead><TableHead className="text-right">Nilai</TableHead></TableRow>
                 </TableHeader>
                 <TableBody>
                   {reportData.map((item) => (
                       <TableRow key={item.id}>
                         <TableCell>{format(parseISO(item.createdAt), 'dd MMM yyyy HH:mm')}</TableCell>
                         <TableCell className="font-black uppercase">{item.customerName}</TableCell>
                         <TableCell className="font-bold uppercase text-primary">{item.carModel}</TableCell>
                         <TableCell><Badge variant="outline">{item.serviceType}</Badge></TableCell>
                         <TableCell className="text-right font-black">Rp {item.totalCost?.toLocaleString('id-ID')}</TableCell>
                       </TableRow>
                     ))}
                 </TableBody>
               </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\:block, .print\:block * {
            visibility: visible;
          }
          .print\:block {
            position: fixed;
            left: 0;
            top: 0;
            width: 58mm;
          }
          @page {
            size: 58mm auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
