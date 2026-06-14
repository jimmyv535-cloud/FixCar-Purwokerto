
'use client';

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { 
  FileText, 
  Plus, 
  Printer, 
  Trash2, 
  Save, 
  ChevronLeft,
  Search,
  Wrench,
  Ban,
  CheckCircle2,
  LayoutGrid,
  Download,
  Calendar,
  Zap,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, query, orderBy, writeBatch, increment } from "firebase/firestore";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import * as XLSX from 'xlsx';

const MONTHS = [
  { value: "0", label: "Januari" },
  { value: "1", label: "Februari" },
  { value: "2", label: "Maret" },
  { value: "3", label: "April" },
  { value: "4", label: "Mei" },
  { value: "5", label: "Juni" },
  { value: "6", label: "Juli" },
  { value: "7", label: "Agustus" },
  { value: "8", label: "September" },
  { value: "9", label: "Oktober" },
  { value: "10", label: "November" },
  { value: "11", label: "Desember" }
];

const KARGLOSS_INFO = {
  name: "Kargloss Autocare Purwokerto",
  address: "Jl. Raya Baturraden KM 5, Pabuaran, Purwokerto Utara, Kab. Banyumas",
  phone: "+62 811-2612-237",
  city: "Purwokerto"
};

export default function InvoicesPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"Tanda Terima" | "Nota Pelunasan">("Tanda Terima");
  const [listFilter, setListFilter] = useState<"semua" | "aktif" | "batal">("aktif");
  const [searchQuery, setSearchQuery] = useState("");
  
  const currentYear = new Date().getFullYear();
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(currentYear.toString());
  
  const isOwner = user?.email === 'owner.kargloss@gmail.com';

  // Fetch Master Services & Inventory Parts
  const masterServicesQuery = useMemoFirebase(() => query(collection(db, "services"), orderBy("name", "asc")), [db]);
  const partsQuery = useMemoFirebase(() => query(collection(db, "parts"), orderBy("name", "asc")), [db]);
  
  const { data: masterServices } = useCollection(masterServicesQuery);
  const { data: inventoryParts } = useCollection(partsQuery);

  const [formData, setFormData] = useState({
    id: "",
    customerName: "",
    customerPhone: "",
    carModel: "",
    plateNumber: "",
    km: "" as string | number,
    fuelLevel: "1/4",
    notes: "",
    status: "Aktif",
    items: [{ desc: "", qty: 1, price: 0, partId: "" as string | null }]
  });

  const invoicesQuery = useMemoFirebase(() => {
    return query(collection(db, "invoices"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: invoices, isLoading } = useCollection(invoicesQuery);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { desc: "", qty: 1, price: 0, partId: null }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSelectMasterService = (index: number, serviceId: string) => {
    const service = masterServices?.find(s => s.id === serviceId);
    if (service) {
      const newItems = [...formData.items];
      newItems[index] = { 
        ...newItems[index], 
        desc: service.name, 
        price: service.price || 0,
        partId: null
      };
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSelectPart = (index: number, partId: string) => {
    const part = inventoryParts?.find(p => p.id === partId);
    if (part) {
      const newItems = [...formData.items];
      newItems[index] = { 
        ...newItems[index], 
        desc: part.name, 
        price: part.sellPrice || 0,
        partId: part.id
      };
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  };

  const formatIndonesianNumber = (val: string | number) => {
    if (val === undefined || val === null || val === "") return "";
    const num = val.toString().replace(/\D/g, "");
    if (!num) return "";
    return new Intl.NumberFormat('id-ID').format(parseInt(num));
  };

  const handleSave = async () => {
    if (!formData.customerName) {
      toast({ variant: "destructive", title: "Minimal Nama Pelanggan wajib diisi." });
      return;
    }

    const dateObj = new Date();
    const datePrefix = dateObj.toISOString().slice(2, 10).replace(/-/g, '');
    const branchPrefix = "KRG";
    const typePrefix = activeTab === "Tanda Terima" ? "PKB" : "INV";
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const docNumber = formData.id && formData.type === activeTab ? formData.invoiceNumber : `${typePrefix}-${branchPrefix}-${datePrefix}-${randomSuffix}`;
    
    const newInvoice = {
      ...formData,
      km: formData.km ? parseInt(formData.km.toString().replace(/\D/g, "")) : 0,
      type: activeTab,
      invoiceNumber: docNumber,
      ...KARGLOSS_INFO,
      total: calculateTotal(),
      createdAt: formData.id ? formData.createdAt : dateObj.toISOString()
    };

    const batch = writeBatch(db);
    const invoiceRef = formData.id && formData.type === activeTab ? doc(db, "invoices", formData.id) : doc(collection(db, "invoices"));

    // Logic: Jika Nota Pelunasan Baru, Deduct Stock
    if (activeTab === "Nota Pelunasan" && (!formData.id || formData.type !== "Nota Pelunasan")) {
      formData.items.forEach(item => {
        if (item.partId) {
          const partRef = doc(db, "parts", item.partId);
          batch.update(partRef, { stock: increment(-item.qty) });

          const logRef = doc(collection(db, "partTransactions"));
          batch.set(logRef, {
            partId: item.partId,
            partName: item.desc,
            type: "out",
            qty: -item.qty,
            referenceId: invoiceRef.id,
            note: `Pemakaian via Invoice ${docNumber}`,
            createdAt: new Date().toISOString()
          });
        }
      });
    }

    batch.set(invoiceRef, newInvoice, { merge: true });
    await batch.commit();

    toast({ title: "Dokumen & Inventaris Diperbarui" });
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: "",
      customerName: "",
      customerPhone: "",
      carModel: "",
      plateNumber: "",
      km: "",
      fuelLevel: "1/4",
      notes: "",
      status: "Aktif",
      items: [{ desc: "", qty: 1, price: 0, partId: null }]
    });
  };

  const handleConvertToInvoice = (pkbData: any) => {
    setFormData({
      ...pkbData,
      id: "", 
      status: "Aktif"
    });
    setActiveTab("Nota Pelunasan");
    setIsCreating(true);
    toast({
      title: "Memproses Pelunasan",
      description: "Data dari Tanda Terima telah disalin ke Nota Pelunasan baru.",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus dokumen ini secara permanen dari database?")) {
      deleteDocumentNonBlocking(doc(db, "invoices", id));
      toast({ title: "Dokumen Dihapus" });
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices?.filter(inv => {
      const createdAt = new Date(inv.createdAt);
      const matchesSearch = inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMonth = filterMonth === "all" || createdAt.getMonth().toString() === filterMonth;
      const matchesYear = filterYear === "all" || createdAt.getFullYear().toString() === filterYear;
      
      const matchesStatus = listFilter === "semua" || 
                           (listFilter === "aktif" && inv.status !== "Batal") || 
                           (listFilter === "batal" && inv.status === "Batal");

      return matchesSearch && matchesMonth && matchesYear && matchesStatus;
    });
  }, [invoices, searchQuery, filterMonth, filterYear, listFilter]);

  if (isCreating) {
    return (
      <div className="space-y-8 animate-fade-in pb-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
          <Button variant="ghost" onClick={() => setIsCreating(false)} className="gap-2 w-fit font-bold uppercase text-[10px]">
            <ChevronLeft className="h-4 w-4" /> KEMBALI
          </Button>
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex gap-2 w-full sm:w-auto">
               <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                 <SelectTrigger className={`flex-1 sm:w-40 h-10 rounded-xl font-bold uppercase text-[10px] ${formData.status === 'Batal' ? 'bg-destructive/10 text-destructive border-destructive' : 'bg-green-100 text-green-700 border-green-200'}`}>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl">
                   <SelectItem value="Aktif">DOKUMEN AKTIF</SelectItem>
                   <SelectItem value="Batal">BATAL SERVIS</SelectItem>
                 </SelectContent>
               </Select>

               <Button variant="outline" onClick={() => window.print()} className="h-10 gap-2 border-primary/20 rounded-xl font-bold text-[10px] uppercase px-4">
                 <Printer className="h-4 w-4" /> CETAK
               </Button>
               <Button onClick={handleSave} className="h-10 gap-2 shadow-lg shadow-primary/20 rounded-xl font-bold text-[10px] uppercase px-4">
                 <Save className="h-4 w-4" /> SIMPAN
               </Button>
             </div>
          </div>
        </div>

        <div className="bg-white text-black p-6 sm:p-8 md:p-12 border shadow-2xl rounded-2xl mx-auto max-w-[210mm] print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:rounded-none relative overflow-hidden">
          {formData.status === "Batal" && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] border-[6px] sm:border-[10px] border-destructive/20 text-destructive/20 text-6xl sm:text-9xl font-black uppercase tracking-[0.5em] pointer-events-none select-none z-0">
              BATAL
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start border-b-4 border-primary pb-6 mb-8 relative z-10 gap-6">
            <div className="flex flex-col">
              <div className="relative w-48 h-12 mb-4">
                 <Image 
                   src="https://i.imgur.com/eoWaIfA.jpeg"
                   alt="Kargloss Autocare Logo"
                   fill
                   className="object-contain object-left"
                   priority
                 />
              </div>
              <p className="text-[10px] font-black uppercase">{KARGLOSS_INFO.name}</p>
              <p className="text-[8px] font-medium max-w-[250px] opacity-70">{KARGLOSS_INFO.address}</p>
            </div>
            <div className="sm:text-right">
              <h1 className="text-2xl font-black uppercase italic tracking-tighter text-primary">{activeTab}</h1>
              <p className="font-mono font-bold text-sm mt-2">#{formData.invoiceNumber || 'DRAFT'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Identitas Pelanggan</Label>
              <Input placeholder="Nama Pelanggan" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="h-10 border-none bg-secondary/30 rounded-xl" />
              <Input placeholder="WhatsApp" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="h-10 border-none bg-secondary/30 rounded-xl" />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Data Kendaraan</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Mobil" value={formData.carModel} onChange={e => setFormData({...formData, carModel: e.target.value})} className="h-10 border-none bg-secondary/30 rounded-xl" />
                <Input placeholder="Nopol" value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value.toUpperCase()})} className="h-10 border-none bg-secondary/30 rounded-xl" />
              </div>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="bg-primary text-white">
                <th className="py-3 px-4 text-left text-[10px] uppercase font-black rounded-l-xl">Deskripsi Pekerjaan / Suku Cadang</th>
                <th className="py-3 px-4 text-center text-[10px] uppercase font-black w-20">Qty</th>
                <th className="py-3 px-4 text-right text-[10px] uppercase font-black w-32">Harga</th>
                <th className="py-3 px-4 text-right text-[10px] uppercase font-black w-32 rounded-r-xl">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {formData.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive print:hidden" onClick={() => removeItem(idx)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Input value={item.desc} onChange={e => updateItem(idx, "desc", e.target.value)} placeholder="Deskripsi..." className="border-none bg-transparent h-8 font-bold" />
                      </div>
                      
                      <div className="pl-8 flex gap-2 print:hidden">
                        <Select onValueChange={(val) => handleSelectMasterService(idx, val)}>
                          <SelectTrigger className="h-7 w-fit text-[8px] font-black uppercase bg-secondary/30 border-none rounded-lg text-primary gap-1">
                            <Zap className="h-3 w-3" /> PILIH LAYANAN
                          </SelectTrigger>
                          <SelectContent>
                            {masterServices?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>

                        <Select onValueChange={(val) => handleSelectPart(idx, val)}>
                          <SelectTrigger className="h-7 w-fit text-[8px] font-black uppercase bg-blue-50 border-none rounded-lg text-blue-600 gap-1">
                            <Package className="h-3 w-3" /> AMBIL STOK PART
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryParts?.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Input type="number" value={item.qty} onChange={e => updateItem(idx, "qty", parseInt(e.target.value) || 0)} className="border-none bg-transparent h-8 text-center font-bold" />
                  </td>
                  <td className="py-3 px-2">
                    <Input type="number" value={item.price} onChange={e => updateItem(idx, "price", parseInt(e.target.value) || 0)} className="border-none bg-transparent h-8 text-right font-bold" />
                  </td>
                  <td className="py-3 px-4 text-right font-black">
                    {(item.qty * item.price).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
              <tr className="print:hidden">
                <td colSpan={4} className="py-4">
                  <Button variant="ghost" size="sm" onClick={addItem} className="text-primary font-bold text-[10px] uppercase">+ Tambah Baris</Button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-primary">
                <td colSpan={2} className="py-6 px-4 text-right text-[10px] font-black uppercase opacity-50">Total Akhir</td>
                <td colSpan={2} className="py-6 px-4 text-right text-2xl font-black text-primary print:text-black">
                  Rp {calculateTotal().toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="grid grid-cols-3 gap-8 text-center pt-8 border-t border-dashed">
            <div>
              <p className="text-[9px] font-black uppercase opacity-50 mb-12">Pelanggan</p>
              <p className="text-[10px] font-black uppercase underline">{formData.customerName || '..........'}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase opacity-50 mb-12">Team Workshop</p>
              <p className="text-[10px] font-black uppercase underline">Kargloss Team</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase opacity-50 mb-12">Service Advisor</p>
              <p className="text-[10px] font-black uppercase underline">Advisor</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 print:hidden pb-10">
      <div className="flex flex-col gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Nota & Invoice</h1>
          <p className="text-muted-foreground font-medium">Buat Tanda Terima Servis (PKB) atau Nota Pelunasan profesional.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Button onClick={() => { resetForm(); setActiveTab("Tanda Terima"); setIsCreating(true); }} className="rounded-xl h-12 gap-2 shadow-lg shadow-primary/20 font-bold uppercase text-[10px] px-8">
            <Plus className="h-5 w-5" /> TANDA TERIMA BARU
          </Button>
          <Button onClick={() => { resetForm(); setActiveTab("Nota Pelunasan"); setIsCreating(true); }} variant="secondary" className="rounded-xl h-12 gap-2 text-primary border border-primary/20 font-bold uppercase text-[10px] px-8">
            <Plus className="h-5 w-5" /> NOTA PELUNASAN
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => <div key={i} className="h-64 bg-secondary/50 rounded-[2rem] animate-pulse" />)
        ) : filteredInvoices?.map((inv) => (
          <Card key={inv.id} className="border-none shadow-xl rounded-[2rem] group hover:shadow-2xl transition-all relative overflow-hidden bg-background">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${inv.type === 'Tanda Terima' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                   {inv.type === 'Tanda Terima' ? 'PKB' : 'INV'}
                </div>
                <div className="min-w-0 pr-10">
                  <h3 className="font-black uppercase text-xl truncate">{inv.invoiceNumber}</h3>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">{inv.customerName} • {new Date(inv.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-dashed">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Total Bayar:</span>
                <span className="font-black text-2xl text-foreground">Rp {inv.total?.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex gap-3">
                {inv.type === 'Tanda Terima' && inv.status !== 'Batal' && (
                  <Button variant="default" onClick={() => handleConvertToInvoice(inv)} className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px]">PELUNASAN</Button>
                )}
                <Button onClick={() => { setFormData(inv); setActiveTab(inv.type); setIsCreating(true); }} className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px] bg-secondary text-primary border-none">LIHAT & CETAK</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
