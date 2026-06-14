
'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  LogOut, 
  Wrench,
  ChevronRight,
  User,
  Users,
  FileText,
  Image as ImageIcon,
  Settings,
  MonitorPlay,
  History,
  Plug,
  Package,
  ShoppingCart,
  ClipboardCheck
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const isOwner = user?.email === 'owner.kargloss@gmail.com';

  const unreadBookingsQuery = useMemoFirebase(() => {
    return query(collection(db, "contactMessages"), where("isRead", "==", false));
  }, [db]);

  const { data: unreadBookings } = useCollection(unreadBookingsQuery);
  const hasUnread = unreadBookings && unreadBookings.length > 0;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const closeMobile = () => {
    setOpenMobile(false);
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full bg-secondary/10">
      <Sidebar className="border-r border-border/50 print:hidden bg-sidebar">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center group" onClick={closeMobile}>
            <Image 
              src="https://i.imgur.com/eoWaIfA.jpeg"
              alt="Kargloss Internal System"
              width={200}
              height={60}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
        </SidebarHeader>
        <Separator className="opacity-50" />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-black tracking-[0.2em] uppercase py-4">Menu Utama</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-11 rounded-lg px-4 hover:bg-primary/5 hover:text-primary transition-all">
                    <Link href="/dashboard" className="flex items-center gap-3" onClick={closeMobile}>
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="font-bold text-sm">Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-11 rounded-lg px-4 hover:bg-primary/5 hover:text-primary transition-all">
                    <Link href="/dashboard/queue" className="flex items-center gap-3" onClick={closeMobile}>
                      <MonitorPlay className="h-5 w-5" />
                      <span className="font-bold text-sm">Monitor Antrian</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-11 rounded-lg px-4 hover:bg-primary/5 hover:text-primary transition-all">
                    <Link href="/dashboard/bookings" className="flex items-center gap-3 relative" onClick={closeMobile}>
                      <CalendarCheck className="h-5 w-5" />
                      <span className="font-bold text-sm">Booking Servis</span>
                      {hasUnread && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-destructive border-2 border-white shadow-sm"></span>
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-11 rounded-lg px-4 hover:bg-primary/5 hover:text-primary transition-all">
                    <Link href="/dashboard/invoices" className="flex items-center gap-3" onClick={closeMobile}>
                      <FileText className="h-5 w-5" />
                      <span className="font-bold text-sm">Nota & Invoice</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-11 rounded-lg px-4 hover:bg-primary/5 hover:text-primary transition-all">
                    <Link href="/dashboard/members" className="flex items-center gap-3" onClick={closeMobile}>
                      <Users className="h-5 w-5" />
                      <span className="font-bold text-sm">Data Member</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-black tracking-[0.2em] uppercase py-4">Inventaris & Stok</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-11 rounded-lg px-4 hover:bg-primary/5 hover:text-primary transition-all">
                    <Link href="/dashboard/inventory" className="flex items-center gap-3" onClick={closeMobile}>
                      <Package className="h-5 w-5" />
                      <span className="font-bold text-sm">Stok Suku Cadang</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-11 rounded-lg px-4 hover:bg-primary/5 hover:text-primary transition-all">
                    <Link href="/dashboard/inventory/purchases" className="flex items-center gap-3" onClick={closeMobile}>
                      <ShoppingCart className="h-5 w-5" />
                      <span className="font-bold text-sm">Pembelian Stok</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isOwner && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-black tracking-[0.2em] uppercase py-4">ADMINISTRATION</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-11 rounded-lg px-4 hover:bg-primary/5 hover:text-primary transition-all">
                      <Link href="/dashboard/promos" className="flex items-center gap-3" onClick={closeMobile}>
                        <ImageIcon className="h-5 w-5" />
                        <span className="font-bold text-sm">Banner Promo</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-11 rounded-lg px-4 hover:bg-primary/5 hover:text-primary transition-all">
                      <Link href="/dashboard/notification-logs" className="flex items-center gap-3" onClick={closeMobile}>
                        <History className="h-5 w-5" />
                        <span className="font-bold text-sm">Notifikasi Log</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-11 rounded-lg px-4 hover:bg-primary/5 hover:text-primary transition-all">
                      <Link href="/dashboard/settings" className="flex items-center gap-3" onClick={closeMobile}>
                        <Settings className="h-5 w-5" />
                        <span className="font-bold text-sm">Pengaturan</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-11 rounded-lg px-4 hover:bg-primary/5 hover:text-primary transition-all">
                      <Link href="/dashboard/settings/integrations" className="flex items-center gap-3" onClick={closeMobile}>
                        <Plug className="h-5 w-5" />
                        <span className="font-bold text-sm">API Integrasi</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="h-11 rounded-lg px-4 hover:bg-destructive/10 hover:text-destructive transition-all">
                <LogOut className="h-5 w-5" />
                <span className="font-bold text-sm">Keluar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background/50 backdrop-blur-md flex items-center px-6 sticky top-0 z-40 print:hidden">
          <SidebarTrigger className="mr-4" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <span>Kargloss System</span>
            <ChevronRight className="h-4 w-4 opacity-30" />
            <span className="text-foreground font-black uppercase tracking-widest text-[11px]">Control Center</span>
          </div>
        </header>
        <main className="p-4 md:p-10 flex-1 print:p-0 overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const isOwner = user?.email === 'owner.kargloss@gmail.com';
  const isAdmin = isOwner || user?.email === 'admin.kargloss@gmail.com';

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/member/dashboard");
      }
    }
  }, [user, isUserLoading, router, isAdmin]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Wrench className="h-10 w-10 text-primary animate-spin" />
          <p className="font-bold uppercase tracking-widest text-sm animate-pulse">Menyiapkan Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <SidebarProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}
