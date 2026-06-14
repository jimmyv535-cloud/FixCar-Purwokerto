
'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plug } from "lucide-react";
import Image from "next/image";

export default function MokaSettingsPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Integrasi Moka POS</h1>
        <p className="text-muted-foreground font-medium">Hubungkan akun Moka POS Anda untuk sinkronisasi data transaksi dan laporan.</p>
      </div>

      <Card className="border-none shadow-2xl rounded-[2rem]">
        <CardHeader className="p-8 bg-secondary/10 border-b">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-black flex items-center justify-center p-2">
              <Image src="https://i.gojekapi.com/darkroom/moka/v2/images/static/open-platform/logo-moka-v2.png" alt="Moka POS" width={80} height={30} className="object-contain" />
            </div>
            <div className="space-y-1">
                <CardTitle className="text-xl font-black uppercase italic">Pengaturan Kredensial</CardTitle>
                <CardDescription>Masukkan Client ID dan Client Secret dari Moka Developer Dashboard.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="max-w-lg space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Client ID</Label>
              <Input placeholder="Masukkan Client ID Anda" className="h-12 bg-secondary/30 border-none rounded-xl font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Client Secret</Label>
              <Input type="password" placeholder="••••••••••••••••••••" className="h-12 bg-secondary/30 border-none rounded-xl font-mono" />
            </div>
            <Button className="h-12 rounded-xl font-black uppercase tracking-widest gap-2">
              <Plug className="h-4 w-4" /> Hubungkan ke Moka
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
