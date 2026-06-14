'use client';

import React, { useState, useMemo } from "react";
import { 
  ShoppingCart, 
  Plus, 
  Calendar, 
  Search, 
  ArrowUpRight, 
  Save, 
  Trash2,
  PackageCheck,
  History as HistoryIcon,
  Package,
  Loader2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, query, orderBy, writeBatch, increment } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function PurchasesPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isNewPartModalOpen, setIsNewPartModalOpen] = useState(false);
  const [isSavingPart, setIsSavingPart] = useState(false);
  
  // State untuk editing record lama
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  const isOwner = user?.email === 'owner.kargloss@gmail.com';

  const [formData, setFormData] = useState({
    supplier: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    items: [{ partId: "", partName: "", qty: 1, buyPrice: 0 }]
  });

  const [newPartForm, setNewPartForm] = useState({
    name: "",
    sku: "",
    category: "General",
    stock: 0,
    minStock: 5,
    buyPrice: 0,
    sellPrice: 0,
    unit: "pcs"
  });

  const partsQuery = useMemoFirebase(() => query(collection(db, "parts"), orderBy("name", "asc")), [db]);
  const purchasesQuery = useMemoFirebase(() => query(collection(db, "partPurchases"), orderBy("createdAt", "desc")), [db]);

  const { data: parts } = useCollection(partsQuery);
  const { data: purchases, isLoading } = useCollection(purchasesQuery);

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const parseNumber = (val: string) => {
    return parseInt(val.replace(/\D/g, "")) || 0;
  };

  const addItem = (target: 'new' | 'edit') => {
    if (target === 'new') {
      setFormData({
        ...formData,
        items: [...formData.items, { partId: "", partName: "", qty: 1, buyPrice: 0 }]
      });
    } else {
      setEditFormData({
        ...editFormData,
        items: [...editFormData.items, { partId: "", partName: "", qty: 1, buyPrice: 0 }]
      });
    }
  };

  const removeItem = (index: number, target: 'new' | 'edit') => {
    if (target === 'new') {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    } else {
      const newItems = editFormData.items.filter((_, i) => i !== index);
      setEditFormData({ ...editFormData, items: newItems });
    }
  };

  const updateItem = (index: number, partId: string, target: 'new' | 'edit') => {
    const part = parts?.find(p => p.id === partId);
    if (!part) return;

    if (target === 'new') {
      const newItems = [...formData.items];
      newItems[index] = { 
        ...newItems[index], 
        partId: part.id, 
        partName: part.name, 
        buyPrice: part.buyPrice || 0 
      };
      setFormData({ ...formData, items: newItems });
    } else {
      const newItems = [...editFormData.items];
      newItems[index] = { 
        ...newItems[index], 
        partId: part.id, 
        partName: part.name, 
        buyPrice: part.buyPrice || 0 
      };
      setEditFormData({ ...editFormData, items: newItems });
    }
  };

  const updateItemField = (index: number, field: string, value: any, target: 'new' | 'edit') => {
    if (target === 'new') {
      const newItems = [...formData.items];
      newItems[index] = { ...newItems[index], [field]: value };
      setFormData({ ...formData, items: newItems });
    } else {
      const newItems = [...editFormData.items];
      newItems[index] = { ...newItems[index], [field]: value };
      setEditFormData({ ...editFormData, items: newItems });
    }
  };

  const handleSavePurchase = () => {
    if (!formData.supplier || formData.items.some(i => !i.partId)) {
      toast({ variant: "destructive", title: "Data belum lengkap" });
      return;
    }

    const batch = writeBatch(db);
    const purchaseRef = doc(collection(db, "partPurchases"));
    
    const purchaseData = {
      ...formData,
      total: formData.items.reduce((sum, i) => sum + (i.qty * i.buyPrice), 0),
      createdAt: new Date().toISOString(),
      status: "approved",
      createdBy: user?.email
    };

    batch.set(purchaseRef, purchaseData);

    formData.items.forEach(item => {
      const partRef = doc(db, "parts", item.partId);
      batch.update(partRef, { stock: increment(item.qty) });

      const logRef = doc(collection(db, "partTransactions"));
      batch.set(logRef, {
        partId: item.partId,
        partName: item.partName,
        type: "in",
        qty: item.qty,
        referenceId: purchaseRef.id,
        note: `Pembelian dari ${formData.supplier}`,
        createdAt: new Date().toISOString()
      });
    });

    batch.commit().then(() => {
      toast({ title: "Pembelian Stok Berhasil Dicatat" });
      setIsAdding(false);
      setFormData({ supplier: "", purchaseDate: new Date().toISOString().split('T')[0], items: [{ partId: "", partName: "", qty: 1, buyPrice: 0 }] });
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'partPurchases',
        operation: 'create',
        requestResourceData: purchaseData
      }));
    });
  };

  const handleSaveNewPart = () => {
    if (!newPartForm.name) {
      toast({ variant: "destructive", title: "Nama barang wajib diisi" });
      return;
    }

    setIsSavingPart(true);
    const partRef = doc(collection(db, "parts"));
    const batch = writeBatch(db);
    
    const partData = { ...newPartForm, id: partRef.id, createdAt: new Date().toISOString() };
    batch.set(partRef, partData);
    
    // Jika ada stok awal, buatkan juga record di partPurchases sebagai riwayat pembukaan stok
    if (newPartForm.stock > 0) {
      const purchaseRef = doc(collection(db, "partPurchases"));
      batch.set(purchaseRef, {
        supplier: "Stok Awal / Opening Balance",
        purchaseDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        status: "approved",
        createdBy: user?.email,
        total: newPartForm.stock * newPartForm.buyPrice,
        items: [{
          partId: partRef.id,
          partName: newPartForm.name,
          qty: newPartForm.stock,
          buyPrice: newPartForm.buyPrice,
          unit: newPartForm.unit
        }]
      });

      const logRef = doc(collection(db, "partTransactions"));
      batch.set(logRef, {
        partId: partRef.id,
        partName: newPartForm.name,
        type: "in",
        qty: newPartForm.stock,
        referenceId: purchaseRef.id,
        note: "Pendaftaran barang baru dengan stok awal",
        createdAt: new Date().toISOString()
      });
    }

    batch.commit().then(() => {
      toast({ title: "Suku Cadang Baru Terdaftar" });
      setIsNewPartModalOpen(false);
      setIsSavingPart(false);
      setNewPartForm({ name: "", sku: "", category: "General", stock: 0, minStock: 5, buyPrice: 0, sellPrice: 0, unit: "pcs" });
    }).catch(err => {
      setIsSavingPart(false);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'parts',
        operation: 'create',
        requestResourceData: partData
      }));
    });
  };

  const handleStartEdit = (purchase: any) => {
    setEditingId(purchase.id);
    setEditFormData({ ...purchase });
  };

  const handleSaveEdit = () => {
    if (!editFormData.supplier || editFormData.items.some((i: any) => !i.partId)) {
      toast({ variant: "destructive", title: "Data belum lengkap" });
      return;
    }

    const docRef = doc(db, "partPurchases", editingId!);
    const newStatus = isOwner ? "approved" : "pending_approval";
    
    const updatedData = {
      ...editFormData,
      total: editFormData.items.reduce((sum: number, i: any) => sum + (i.qty * i.buyPrice), 0),
      status: newStatus,
      updatedAt: new Date().toISOString(),
      lastEditedBy: user?.email
    };

    updateDocumentNonBlocking(docRef, updatedData);
    
    toast({ 
      title: isOwner ? "Data Diperbarui" : "Perubahan Diajukan", 
      description: isOwner ? "Perubahan telah disimpan secara permanen." : "Menunggu persetujuan Owner." 
    });
    
    setEditingId(null);
    setEditFormData(null);
  };

  const handleApprove = (purchaseId: string) => {
    if (!isOwner) return;
    const docRef = doc(db, "partPurchases", purchaseId);
    updateDocumentNonBlocking(docRef, { status: "approved" });
    toast({ title: "Perubahan Disetujui" });
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Pembelian Inventaris</h1>
          <p className="text-muted-foreground font-medium">Input nota belanja barang untuk menambah stok otomatis.</p>
        </div>
        
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"} className="rounded-xl h-12 gap-2 shadow-lg shadow-primary/20 font-bold uppercase text-[10px]">
          {isAdding ? "BATAL" : <><Plus className="h-5 w-5" /> CATAT PEMBELIAN BARU</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden animate-fade-in">
          <CardHeader className="p-8 bg-primary text-white">
            <CardTitle className="text-xl font-black uppercase italic flex items-center gap-3">
              <ShoppingCart className="h-6 w-6" /> Form Nota Belanja
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Supplier / Vendor</Label>
                <Input value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="Nama Toko / Distributor" className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Tanggal Nota</Label>
                <Input type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Daftar Barang Belanja</Label>
              <div className="space-y-3">
                {formData.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-secondary/10 p-4 rounded-2xl items-end">
                    <div className="md:col-span-6 flex gap-2">
                      <div className="flex-1">
                        <Select value={item.partId} onValueChange={(val) => updateItem(idx, val, 'new')}>
                          <SelectTrigger className="h-11 bg-background border-none rounded-xl font-bold">
                            <SelectValue placeholder="Pilih Suku Cadang..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {parts?.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Stok: {formatNumber(p.stock)})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="h-11 w-11 shrink-0 rounded-xl bg-background border-none hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setIsNewPartModalOpen(true)}
                        title="Tambah Suku Cadang Baru ke Sistem"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="md:col-span-2">
                      <Input 
                        type="text" 
                        placeholder="Qty" 
                        value={formatNumber(item.qty)} 
                        onFocus={(e) => e.target.select()} 
                        onChange={e => updateItemField(idx, "qty", parseNumber(e.target.value), 'new')} 
                        className="h-11 bg-background border-none rounded-xl font-bold text-center" 
                      />
                    </div>
                    <div className="md:col-span-3 relative">
                      <Input 
                        type="text" 
                        placeholder="Harga Beli" 
                        value={formatNumber(item.buyPrice)} 
                        onFocus={(e) => e.target.select()} 
                        onChange={e => updateItemField(idx, "buyPrice", parseNumber(e.target.value), 'new')} 
                        className="h-11 bg-background border-none rounded-xl font-bold pl-8" 
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">Rp</span>
                    </div>
                    <div className="md:col-span-1 flex justify-center">
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(idx, 'new')} disabled={formData.items.length === 1}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" onClick={() => addItem('new')} className="text-primary font-bold text-[10px] uppercase">+ Tambah Baris</Button>
              </div>
            </div>

            <div className="flex justify-end border-t pt-6">
              <Button onClick={handleSavePurchase} className="h-14 px-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl">
                SIMPAN & UPDATE STOK <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-black uppercase italic flex items-center gap-2">
          <HistoryIcon className="h-5 w-5 text-primary" /> Riwayat Belanja Stok
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            Array(2).fill(0).map((_, i) => <div key={i} className="h-32 bg-secondary/20 rounded-3xl animate-pulse" />)
          ) : purchases && purchases.length > 0 ? (
            purchases.map((pur) => (
              <Card key={pur.id} className={`border-none shadow-xl rounded-[2rem] bg-background border overflow-hidden transition-all ${pur.status === 'pending_approval' ? 'ring-2 ring-amber-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black uppercase text-lg leading-tight">{pur.supplier}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 opacity-40" />
                        <p className="text-[10px] font-bold text-muted-foreground">{new Date(pur.purchaseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {pur.status === 'pending_approval' ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold uppercase text-[9px] gap-1"><AlertCircle className="h-3 w-3" /> MENUNGGU PERSETUJUAN</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 font-bold uppercase text-[9px] gap-1"><CheckCircle2 className="h-3 w-3" /> DISETUJUI</Badge>
                      )}
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleStartEdit(pur)}><Edit2 className="h-3.5 w-3.5 text-primary" /></Button>
                        {isOwner && pur.status === 'pending_approval' && (
                          <Button variant="default" size="sm" className="h-7 rounded-lg text-[8px] font-black uppercase bg-green-600 hover:bg-green-700" onClick={() => handleApprove(pur.id)}>SETUJUI</Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 border-t pt-4">
                    {pur.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="font-medium opacity-70">{item.partName}</span>
                        <span className="font-bold">x{formatNumber(item.qty)} {item.unit || 'pcs'}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-dashed pt-2 mt-2">
                      <span className="text-[10px] font-black uppercase opacity-40">Total Pembelian</span>
                      <span className="text-sm font-black text-primary">Rp {pur.total?.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] space-y-4">
              <Package className="h-12 w-12 mx-auto opacity-10" />
              <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest">Belum ada riwayat belanja yang tercatat</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Purchase Modal */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="rounded-[2rem] border-none shadow-3xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase text-primary flex items-center gap-3">
              <Edit2 className="h-6 w-6" /> Edit Daftar Belanja
            </DialogTitle>
          </DialogHeader>
          {editFormData && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Supplier</Label>
                  <Input value={editFormData.supplier} onChange={e => setEditFormData({...editFormData, supplier: e.target.value})} className="h-11 bg-secondary/20 border-none rounded-xl font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Tanggal</Label>
                  <Input type="date" value={editFormData.purchaseDate} onChange={e => setEditFormData({...editFormData, purchaseDate: e.target.value})} className="h-11 bg-secondary/20 border-none rounded-xl font-bold" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase opacity-50">Daftar Item</Label>
                {editFormData.items.map((item: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-secondary/5 p-3 rounded-xl">
                    <div className="md:col-span-6">
                      <Select value={item.partId} onValueChange={(val) => updateItem(idx, val, 'edit')}>
                        <SelectTrigger className="h-10 bg-background border-none rounded-lg font-bold text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {parts?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Input type="text" value={formatNumber(item.qty)} onChange={e => updateItemField(idx, "qty", parseNumber(e.target.value), 'edit')} className="h-10 text-center font-bold text-xs rounded-lg" />
                    </div>
                    <div className="md:col-span-3">
                      <Input type="text" value={formatNumber(item.buyPrice)} onChange={e => updateItemField(idx, "buyPrice", parseNumber(e.target.value), 'edit')} className="h-10 font-bold text-xs rounded-lg" />
                    </div>
                    <div className="md:col-span-1 flex justify-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(idx, 'edit')}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addItem('edit')} className="text-primary font-bold text-[9px] uppercase">+ Tambah Item</Button>
              </div>
              
              {!isOwner && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-[10px] font-medium text-amber-800 uppercase leading-relaxed">Anda masuk sebagai Admin. Perubahan yang Anda simpan akan mengubah status nota menjadi "Menunggu Persetujuan" dan membutuhkan konfirmasi Owner.</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 pt-4 border-t">
            <Button variant="ghost" onClick={() => setEditingId(null)} className="rounded-xl uppercase font-bold text-xs">BATAL</Button>
            <Button onClick={handleSaveEdit} className="rounded-xl font-black uppercase text-xs shadow-lg shadow-primary/20 px-8">
              {isOwner ? "SIMPAN PERUBAHAN" : "AJUKAN PERUBAHAN"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Add Part Modal */}
      <Dialog open={isNewPartModalOpen} onOpenChange={setIsNewPartModalOpen}>
        <DialogContent className="rounded-[2rem] border-none shadow-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase text-primary flex items-center gap-3">
              <Package className="h-6 w-6" /> Registrasi Suku Cadang Baru
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Nama Barang</Label>
                <Input value={newPartForm.name} onChange={e => setNewPartForm({...newPartForm, name: e.target.value})} placeholder="Contoh: Oli Shell Helix" className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">SKU / Kode Part</Label>
                <Input value={newPartForm.sku} onChange={e => setNewPartForm({...newPartForm, sku: e.target.value})} placeholder="SH-5W30" className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Stok Saat Ini</Label>
                <Input 
                  type="text" 
                  value={formatNumber(newPartForm.stock)} 
                  onFocus={(e) => e.target.select()} 
                  onChange={e => setNewPartForm({...newPartForm, stock: parseNumber(e.target.value)})} 
                  className="h-12 bg-secondary/30 border-none rounded-xl font-bold text-center" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Min. Stok</Label>
                <Input 
                  type="text" 
                  value={formatNumber(newPartForm.minStock)} 
                  onFocus={(e) => e.target.select()} 
                  onChange={e => setNewPartForm({...newPartForm, minStock: parseNumber(e.target.value)})} 
                  className="h-12 bg-secondary/30 border-none rounded-xl font-bold text-center" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Satuan</Label>
                <Input value={newPartForm.unit} onChange={e => setNewPartForm({...newPartForm, unit: e.target.value})} placeholder="Botol / Pcs" className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Harga Beli Standar</Label>
                <div className="relative">
                  <Input 
                    type="text" 
                    value={formatNumber(newPartForm.buyPrice)} 
                    onFocus={(e) => e.target.select()} 
                    onChange={e => setNewPartForm({...newPartForm, buyPrice: parseNumber(e.target.value)})} 
                    className="h-12 bg-secondary/30 border-none rounded-xl font-bold pl-10" 
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black opacity-40">Rp</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Harga Jual Nota</Label>
                <div className="relative">
                  <Input 
                    type="text" 
                    value={formatNumber(newPartForm.sellPrice)} 
                    onFocus={(e) => e.target.select()} 
                    onChange={e => setNewPartForm({...newPartForm, sellPrice: parseNumber(e.target.value)})} 
                    className="h-12 bg-secondary/30 border-none rounded-xl font-bold pl-10" 
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black opacity-40">Rp</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4 border-t border-dashed">
            <Button variant="ghost" onClick={() => setIsNewPartModalOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">BATAL</Button>
            <Button onClick={handleSaveNewPart} disabled={isSavingPart} className="rounded-xl font-black uppercase text-[10px] px-8 shadow-xl bg-primary text-white">
              {isSavingPart ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "DAFTARKAN BARANG"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
