
'use client';

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Wrench,
  CheckCircle2,
  Clock,
  Banknote,
  ShoppingCart,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  LineChart
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import { startOfDay, startOfMonth, isSameDay, isSameMonth, parseISO } from "date-fns";

export default function DashboardOverview() {
  const db = useFirestore();
  
  // Data Fetching
  const bookingsQuery = useMemoFirebase(() => {
    return query(collection(db, "contactMessages"), orderBy("submissionDateTime", "desc"), limit(5));
  }, [db]);

  const allBookingsQuery = useMemoFirebase(() => collection(db, "contactMessages"), [db]);
  const invoicesQuery = useMemoFirebase(() => collection(db, "invoices"), [db]);
  const partsQuery = useMemoFirebase(() => collection(db, "parts"), [db]);
  const purchasesQuery = useMemoFirebase(() => collection(db, "partPurchases"), [db]);

  const { data: recentBookings, isLoading: isBookingsLoading } = useCollection(bookingsQuery);
  const { data: allBookings } = useCollection(allBookingsQuery);
  const { data: invoices } = useCollection(invoicesQuery);
  const { data: parts } = useCollection(partsQuery);
  const { data: purchases } = useCollection(purchasesQuery);

  // Financial Calculations
  const financeStats = useMemo(() => {
    const now = new Date();
    
    // Revenue (from Nota Pelunasan only)
    const revenueDocs = invoices?.filter(inv => inv.type === "Nota Pelunasan" && inv.status !== "Batal") || [];
    const todayRevenue = revenueDocs
      .filter(inv => isSameDay(parseISO(inv.createdAt), now))
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    const monthRevenue = revenueDocs
      .filter(inv => isSameMonth(parseISO(inv.createdAt), now))
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    // Expenses (from Approved Purchases)
    const expenseDocs = purchases?.filter(pur => pur.status === "approved") || [];
    const todayExpense = expenseDocs
      .filter(pur => isSameDay(parseISO(pur.createdAt), now))
      .reduce((sum, pur) => sum + (pur.total || 0), 0);
    const monthExpense = expenseDocs
      .filter(pur => isSameMonth(parseISO(pur.createdAt), now))
      .reduce((sum, pur) => sum + (pur.total || 0), 0);

    // Inventory Value
    const inventoryValue = parts?.reduce((sum, part) => sum + ((part.stock || 0) * (part.buyPrice || 0)), 0) || 0;

    return {
      todayRevenue,
      monthRevenue,
      todayExpense,
      monthExpense,
      inventoryValue
    };
  }, [invoices, purchases, parts]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Ringkasan Operasional</h1>
        <p className="text-muted-foreground font-medium">Laporan performa dan finansial Kargloss Autocare secara real-time.</p>
      </div>

      {/* Financial Section - Primary Mobile Focus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <Card className="border-none shadow-2xl rounded-[2rem] bg-black text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-secondary/20 transition-all" />
          <CardHeader className="p-8 pb-2">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-secondary text-primary">
                <Banknote className="h-6 w-6" />
              </div>
              <Badge className="bg-green-500 text-white border-none font-black text-[10px]">REVENUE</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase opacity-50 tracking-widest mb-1">Pendapatan Bulan Ini</p>
              <h3 className="text-3xl font-black italic tracking-tighter">{formatCurrency(financeStats.monthRevenue)}</h3>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
              <div>
                <p className="text-[9px] font-bold uppercase opacity-40">Hari Ini</p>
                <p className="text-sm font-black text-secondary">{formatCurrency(financeStats.todayRevenue)}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-green-400" />
            </div>
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card className="border-none shadow-2xl rounded-[2rem] bg-white overflow-hidden relative group border">
          <CardHeader className="p-8 pb-2">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="border-primary/20 text-primary font-black text-[10px]">EXPENSES</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Belanja Stok Bulan Ini</p>
              <h3 className="text-3xl font-black italic tracking-tighter text-primary">{formatCurrency(financeStats.monthExpense)}</h3>
            </div>
            <div className="pt-4 border-t border-dashed flex justify-between items-end">
              <div>
                <p className="text-[9px] font-bold uppercase text-muted-foreground opacity-60">Hari Ini</p>
                <p className="text-sm font-black text-primary">{formatCurrency(financeStats.todayExpense)}</p>
              </div>
              <ArrowDownRight className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Value Card */}
        <Card className="border-none shadow-2xl rounded-[2rem] bg-secondary text-primary overflow-hidden relative group">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mb-16 blur-2xl" />
          <CardHeader className="p-8 pb-2">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-primary text-secondary">
                <Package className="h-6 w-6" />
              </div>
              <Badge className="bg-primary text-white border-none font-black text-[10px]">ASSET</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Nilai Inventaris (Gudang)</p>
              <h3 className="text-3xl font-black italic tracking-tighter">{formatCurrency(financeStats.inventoryValue)}</h3>
            </div>
            <div className="pt-4 border-t border-primary/10">
              <p className="text-[9px] font-bold uppercase opacity-60">Total {parts?.length || 0} Jenis Suku Cadang</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* General Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { title: "Total Booking", value: allBookings?.length || 0, icon: MessageSquare, color: "bg-blue-500" },
          { title: "Belum Diproses", value: allBookings?.filter(b => !b.isRead).length || 0, icon: Clock, color: "bg-amber-500" },
          { title: "Servis Selesai", value: allBookings?.filter(b => b.isRead).length || 0, icon: CheckCircle2, color: "bg-green-500" },
          { title: "Customer Satisfaction", value: "98%", icon: TrendingUp, color: "bg-primary" },
        ].map((stat, idx) => (
          <Card key={idx} className="border-none shadow-xl shadow-primary/5 overflow-hidden">
            <CardContent className="p-4 md:p-6 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">{stat.title}</p>
                <h3 className="text-xl md:text-2xl font-black tabular-nums">{stat.value}</h3>
              </div>
              <div className={`${stat.color} p-2 md:p-3 rounded-xl text-white shadow-lg shrink-0 ml-2`}>
                <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-none shadow-2xl rounded-[2.5rem]">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black italic uppercase">Pendaftaran Terbaru</CardTitle>
                <p className="text-sm text-muted-foreground font-medium mt-1">Monitor antrian pendaftaran hari ini.</p>
              </div>
              <LineChart className="h-5 w-5 text-primary opacity-50" />
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="space-y-4 mt-6">
              {isBookingsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-secondary/50 rounded-2xl animate-pulse" />
                ))
              ) : recentBookings && recentBookings.length > 0 ? (
                recentBookings.map((booking, idx) => (
                  <div key={idx} className="flex items-center gap-4 md:gap-6 p-4 rounded-2xl hover:bg-secondary/30 transition-colors group border border-transparent hover:border-secondary/50">
                    <div className="h-12 w-12 rounded-xl bg-background border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                      <Wrench className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-black text-sm uppercase truncate">{booking.senderName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                          {new Date(booking.submissionDateTime).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-[10px] md:text-xs text-muted-foreground font-medium truncate">
                        {booking.carType} • {booking.serviceType}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <p className="font-bold text-muted-foreground">Belum ada pendaftaran masuk hari ini.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-2xl bg-primary rounded-[2.5rem] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <CardHeader className="p-8 relative z-10">
            <CardTitle className="text-xl font-black italic uppercase">Bantuan Sistem</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 relative z-10 space-y-6">
            <p className="text-sm opacity-80 leading-relaxed font-medium">
              Dashboard ini mengintegrasikan data dari CRM (Booking), Inventaris, dan Kasir (Invoice) untuk memberikan gambaran kesehatan bisnis yang akurat.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Support Email</p>
                <p className="text-sm font-bold truncate">jimmy.tjahyono@gmail.com</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">WhatsApp Support</p>
                <p className="text-sm font-bold">0895-8035-01000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
