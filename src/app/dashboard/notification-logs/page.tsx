
'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  AlertCircle, 
  Send,
  History,
  Smartphone,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";

/**
 * @fileOverview Halaman pemantauan notifikasi FCM.
 * Membantu Admin mendeteksi efektivitas broadcast dan jumlah token aktif.
 */
export default function NotificationLogsPage() {
  const db = useFirestore();

  // Query Log Broadcast
  const logsQuery = useMemoFirebase(() => {
    return query(collection(db, "broadcastLogs"), orderBy("sentAt", "desc"));
  }, [db]);

  // Query Member dengan Token Aktif (Untuk statistik token)
  const activeTokensQuery = useMemoFirebase(() => {
    return query(collection(db, "members"), where("fcmToken", "!=", null));
  }, [db]);

  const { data: logs, isLoading } = useCollection(logsQuery);
  const { data: activeMembers } = useCollection(activeTokensQuery);

  // Kalkulasi Statistik
  const totalSuccess = logs?.reduce((acc, curr) => acc + (curr.successCount || 0), 0) || 0;
  const totalFails = logs?.reduce((acc, curr) => acc + (curr.failCount || 0), 0) || 0;

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Notifikasi Log</h1>
        <p className="text-muted-foreground font-medium">Laporan pengiriman pesan promo ke perangkat pelanggan secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-primary text-white overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Total Sesi Broadcast</p>
                <h3 className="text-3xl font-black">{logs?.length || 0}</h3>
              </div>
              <Send className="h-8 w-8 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl bg-[#00B14F] text-white overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Sukses Terkirim</p>
                <h3 className="text-3xl font-black">{totalSuccess}</h3>
                <p className="text-[9px] font-bold opacity-80 mt-1 uppercase italic flex items-center gap-1">
                  <Smartphone className="h-3 w-3" /> {activeMembers?.length || 0} Token Aktif Terdeteksi
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-destructive text-white overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Isu Pengiriman</p>
                <h3 className="text-3xl font-black">{totalFails}</h3>
              </div>
              <AlertCircle className="h-8 w-8 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 pb-4 bg-secondary/10">
          <CardTitle className="text-xl font-black italic uppercase flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            Detail Aktivitas FCM
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow className="border-none">
                <TableHead className="py-6 px-8 font-black uppercase text-[10px]">Waktu</TableHead>
                <TableHead className="font-black uppercase text-[10px]">Judul Promo</TableHead>
                <TableHead className="font-black uppercase text-[10px]">Status</TableHead>
                <TableHead className="font-black uppercase text-[10px]">Sukses / Total</TableHead>
                <TableHead className="font-black uppercase text-[10px]">Detail Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={5} className="py-8 animate-pulse bg-secondary/5" /></TableRow>)
              ) : logs && logs.length > 0 ? (
                logs.map((log) => {
                  const isSuccess = log.status === "Success" || (log.successCount > 0 && log.failCount === 0);
                  return (
                    <TableRow key={log.id} className="group hover:bg-secondary/5 transition-colors">
                      <TableCell className="py-6 px-8 font-bold text-xs opacity-60">
                        {new Date(log.sentAt).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="font-black uppercase text-sm">
                        {log.promoTitle}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${isSuccess ? "bg-[#00B14F] text-white hover:bg-[#00B14F]/90" : "bg-destructive text-white hover:bg-destructive/90"} rounded-full font-black text-[9px] gap-1 px-4 py-1 border-none`}>
                          {isSuccess ? "BERHASIL" : "GAGAL"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-primary tabular-nums">
                        {log.successCount || 0} / {log.targetCount || 0}
                      </TableCell>
                      <TableCell className="text-[10px] font-medium text-muted-foreground max-w-xs py-6">
                        {isSuccess ? "-" : (log.error || "Token kadaluwarsa atau belum terdaftar.")}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-muted-foreground font-bold uppercase text-xs opacity-30">
                    Belum ada riwayat broadcast promo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
