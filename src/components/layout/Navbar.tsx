
"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, LayoutDashboard, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image 
            src="https://i.imgur.com/uU7xwVk.jpeg"
            alt="Kargloss Autocare Logo"
            width={180}
            height={45}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/#layanan" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Layanan</Link>
          <Link href="/#lokasi" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Lokasi</Link>
          <Link href="/member" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Cek Antrian</Link>
          
          {user ? (
            <Button asChild variant="default" className="bg-primary hover:bg-primary/90 rounded-xl px-6">
              <Link href="/login" className="flex items-center gap-2 font-black uppercase tracking-tighter">
                <LayoutDashboard className="h-4 w-4" /> Panel Anda
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl px-6 transition-all">
              <Link href="/login" className="flex items-center gap-2 font-black uppercase tracking-tighter">
                <LogIn className="h-4 w-4" /> Login
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 rounded-lg bg-muted" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t p-6 space-y-4 bg-background animate-in slide-in-from-top-4 duration-300">
          <Link href="/#layanan" className="block text-lg font-black uppercase tracking-tighter" onClick={() => setIsOpen(false)}>Layanan</Link>
          <Link href="/#lokasi" className="block text-lg font-black uppercase tracking-tighter" onClick={() => setIsOpen(false)}>Lokasi</Link>
          <Link href="/member" className="block text-lg font-black uppercase tracking-tighter" onClick={() => setIsOpen(false)}>Cek Antrian</Link>
          <div className="pt-4 border-t">
            {user ? (
              <Button asChild className="w-full bg-primary h-12 rounded-xl">
                <Link href="/login" onClick={() => setIsOpen(false)} className="font-black uppercase tracking-tighter">Panel Anda</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full border-2 border-primary h-12 rounded-xl">
                <Link href="/login" onClick={() => setIsOpen(false)} className="font-black uppercase tracking-tighter text-primary">Login</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
