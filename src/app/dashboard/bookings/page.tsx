
'use client';

import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  MessageSquare, 
  Search,
  CheckCircle2,
  Clock,
  Phone,
  Edit2,
  Save,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function BookingsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  const isOwner = user?.email === 'owner.kargloss@gmail.com';

  const bookingsQuery = useMemoFirebase(() => {
    return query(collection(db, "contactMessages"), orderBy("submissionDateTime", "desc"));
  }, [db]);

  const servicesQuery = useMemoFirebase(() => {
    return query(collection(db, "services"), orderBy("name", "asc"));
  }, [db]);

  const { data: bookings, isLoading } = useCollection(bookingsQuery);
  const { data: services } = useCollection(servicesQuery);

  const markAsRead = (id: string) => {
    const docRef = doc(db, "contactMessages", id);
    updateDocumentNonBlocking(docRef, { isRead: true });
    toast({ title: "Status Diperbarui", description: "Booking telah ditandai sebagai 'Diproses'." });
  };

  const startEdit = (booking: any) => {
    setEditingId(booking.id);
    setEditData({ ...booking });
  };

  const saveEdit = () => {
    if (!editingId || !editData) return;
    updateDocumentNonBlocking(doc(db, "contactMessages", editingId), editData);
    setEditingId(null);
    toast({ title: "Booking Diperbarui" });
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) {
      toast({ variant: "destructive", title: "Nomor Tidak Ada" });
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '62');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const filteredBookings = bookings?.filter(b => 
    b.senderName?.toLowerCase().includes(search.toLowerCase()) || 
    b.carType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Bookings</h1>
          <p className="text-muted-foreground font-medium">Manajemen reservasi dan pesan masuk dari website.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari booking..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-xl bg-background border-none shadow-xl shadow-primary/5"
          />
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 pb-4 border-b bg-secondary/10">
          <CardTitle className="text-xl font-black italic uppercase flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" />
            Daftar Reservasi & Pertanyaan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow className="border-none">
                <TableHead className="py-6 px-8 font-black uppercase text-[10px]">Tanggal</TableHead>
                <TableHead className="font-black uppercase text-[10px]">Pelanggan</TableHead>
                <TableHead className="font-black uppercase text-[10px]">Unit & Layanan</TableHead>
                <TableHead className="font-black uppercase text-[10px]">Status</TableHead>
                <TableHead className="text-right py-6 px-8 font-black uppercase text-[10px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={5} className="py-10 animate-pulse bg-secondary/10" /></TableRow>)
              ) : filteredBookings?.map((booking) => (
                <TableRow key={booking.id} className="group hover:bg-secondary/5 transition-colors">
                  <TableCell className="py-6 px-8 font-bold text-xs opacity-60">
                    {new Date(booking.submissionDateTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    {editingId === booking.id ? (
                      <Input value={editData.senderName} onChange={e => setEditData({...editData, senderName: e.target.value})} className="h-9 rounded-lg text-sm" />
                    ) : (
                      <div className="space-y-0.5">
                        <p className="font-black text-sm uppercase">{booking.senderName}</p>
                        <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1"><Phone className="h-3 w-3" />{booking.phone}</p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === booking.id ? (
                      <div className="space-y-2">
                        <Input value={editData.carType} onChange={e => setEditData({...editData, carType: e.target.value})} className="h-9 rounded-lg text-sm" placeholder="Mobil" />
                        <Select value={editData.serviceType} onValueChange={v => setEditData({...editData, serviceType: v})}>
                          <SelectTrigger className="h-9 rounded-lg text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {services?.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                            <SelectItem value="Tanya Layanan">Tanya Layanan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs uppercase text-primary">{booking.carType}</p>
                        <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 px-2">{booking.serviceType}</Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {booking.isRead ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 rounded-full font-bold text-[9px] gap-1 px-3"><CheckCircle2 className="h-3 w-3" />DIPROSES</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-primary/10 text-primary rounded-full font-bold text-[9px] gap-1 px-3 border border-primary/20"><Clock className="h-3 w-3" />MENUNGGU</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-6 px-8">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === booking.id ? (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={saveEdit}><Save className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <>
                          {isOwner && <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(booking)}><Edit2 className="h-3.5 w-3.5" /></Button>}
                          <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold text-[10px] gap-2" onClick={() => openWhatsApp(booking.phone)}><Phone className="h-3 w-3" /> HUBUNGI</Button>
                          {!booking.isRead && <Button size="sm" className="h-8 rounded-lg font-bold text-[10px]" onClick={() => markAsRead(booking.id)}>SELESAI</Button>}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
