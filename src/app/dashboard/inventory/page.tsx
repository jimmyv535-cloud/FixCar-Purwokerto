'use client';

import React, { useState, useMemo } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  History, 
  Edit2, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft,
  Filter,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, query, orderBy, writeBatch } from "firebase/firestore";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function InventoryPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);
  
  const [formData, setFormData] = useState({
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
  const { data: parts, isLoading } = useCollection(partsQuery);

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const parseNumber = (val: string) => {
    return parseInt(val.replace(/\D/g, "")) || 0;
  };

  const filteredParts = useMemo(() => {
    if (!parts) return [];
    return parts.filter(p => 
      p.name?.toLowerCase().includes(search.toLowerCase()) || 
      p.sku?.toLowerCase().includes(search.toLowerCase())
    );
  }, [parts, search]);

  const handleOpenModal = (part: any) => {
    setEditingPart(part);
    setFormData({ ...part });
    setIsServiceModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !editingPart) return;

    updateDocumentNonBlocking(doc(db, "parts", editingPart.id), formData);
    toast({ title: "Informasi Suku Cadang Diperbarui" });
    setIsServiceModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus permanen "${name}" dari sistem?`)) {
      deleteDocumentNonBlocking(doc(db, "parts", id));
      toast({ title: "Data Dihapus" });
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Stok Suku Cadang</h1>
          <p className="text-muted-foreground font-medium">Monitoring ketersediaan barang. Tambah barang baru hanya melalui menu Pembelian.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-primary text-white overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase opacity-60 mb-1">Total Jenis Item</p>
              <h3 className="text-3xl font-black">{parts?.length || 0}</h3>
            </div>
            <Package className="h-10 w-10 opacity-20" />
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl bg-amber-500 text-white overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase opacity-60 mb-1">Stok Menipis</p>
              <h3 className="text-3xl font-black">{parts?.filter(p => p.stock <= p.minStock).length || 0}</h3>
            </div>
            <AlertTriangle className="h-10 w-10 opacity-20" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-background border overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Nilai Inventaris (Estimasi)</p>
              <h3 className="text-3xl font-black">
                Rp {parts?.reduce((acc, curr) => acc + (curr.stock * curr.buyPrice), 0).toLocaleString('id-ID')}
              </h3>
            </div>
            <CheckCircle2 className="h-10 w-10 text-primary opacity-10" />
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Cari nama part atau SKU..." 
          className="pl-12 h-12 rounded-xl bg-background border-none shadow-xl shadow-primary/5 font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-secondary/20 rounded-3xl animate-pulse" />)
        ) : filteredParts.map((part) => (
          <Card key={part.id} className="border-none shadow-lg rounded-3xl group hover:shadow-xl transition-all bg-background overflow-hidden border border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="flex items-center gap-4 w-full lg:w-1/3">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${part.stock <= part.minStock ? 'bg-amber-100 text-amber-600' : 'bg-primary text-white'}`}>
                    {formatNumber(part.stock)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black uppercase text-base truncate">{part.name}</h3>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1">SKU: {part.sku || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 w-full lg:flex-1 border-t lg:border-t-0 lg:border-l border-dashed border-border/50 pt-4 lg:pt-0 lg:pl-8">
                  <div>
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Harga Jual</p>
                    <p className="font-bold text-primary">Rp {part.sellPrice?.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Kategori</p>
                    <Badge variant="outline" className="font-bold text-[10px] uppercase">{part.category}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 lg:border-l border-dashed border-border/50 lg:pl-8">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleOpenModal(part)}><Edit2 className="h-4 w-4 text-primary" /></Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive" onClick={() => handleDelete(part.id, part.name)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="rounded-[2rem] border-none shadow-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase text-primary flex items-center gap-3">
              <Package className="h-6 w-6" /> Edit Detail Suku Cadang
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Nama Barang</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">SKU / Kode Part</Label>
                <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Stok (Lock)</Label>
                <Input type="text" value={formatNumber(formData.stock)} disabled className="h-12 bg-secondary/10 border-none rounded-xl font-bold opacity-50 cursor-not-allowed text-center" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Min. Stok</Label>
                <Input 
                  type="text" 
                  value={formatNumber(formData.minStock)} 
                  onFocus={(e) => e.target.select()} 
                  onChange={e => setFormData({...formData, minStock: parseNumber(e.target.value)})} 
                  className="h-12 bg-secondary/30 border-none rounded-xl font-bold text-center" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Satuan</Label>
                <Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Harga Beli</Label>
                <div className="relative">
                  <Input 
                    type="text" 
                    value={formatNumber(formData.buyPrice)} 
                    onFocus={(e) => e.target.select()} 
                    onChange={e => setFormData({...formData, buyPrice: parseNumber(e.target.value)})} 
                    className="h-12 bg-secondary/30 border-none rounded-xl font-bold pl-10" 
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black opacity-40">Rp</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Harga Jual</Label>
                <div className="relative">
                  <Input 
                    type="text" 
                    value={formatNumber(formData.sellPrice)} 
                    onFocus={(e) => e.target.select()} 
                    onChange={e => setFormData({...formData, sellPrice: parseNumber(e.target.value)})} 
                    className="h-12 bg-secondary/30 border-none rounded-xl font-bold pl-10" 
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black opacity-40">Rp</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4 border-t border-dashed">
            <Button variant="ghost" onClick={() => setIsServiceModalOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">BATAL</Button>
            <Button onClick={handleSave} className="rounded-xl font-black uppercase text-[10px] px-8 shadow-xl bg-primary text-white">UPDATE DATA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
