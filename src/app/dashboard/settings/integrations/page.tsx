
'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">API Integrasi</h1>
        <p className="text-muted-foreground font-medium">Hubungkan aplikasi dengan layanan pihak ketiga seperti Moka POS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link href="/dashboard/settings/moka" className="block group">
          <Card className="border-none shadow-xl rounded-[2rem] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-black uppercase italic">Moka POS</CardTitle>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              <CardDescription>Integrasi Point-of-Sale untuk sinkronisasi data transaksi.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-12 w-24 relative">
                <Image
                  src="https://i.gojekapi.com/darkroom/moka/v2/images/static/open-platform/logo-moka-v2.png"
                  alt="Moka POS Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
