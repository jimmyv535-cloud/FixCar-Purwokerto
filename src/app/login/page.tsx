
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Loader2, ShieldCheck, ArrowLeft, Eye, EyeOff, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const checkRoleAndRedirect = async (firebaseUser: any) => {
    if (!firebaseUser || !firebaseUser.email) return;
    
    const ownerEmail = 'owner.kargloss@gmail.com';
    const adminEmail = 'admin.kargloss@gmail.com';
    
    try {
      if (firebaseUser.email === ownerEmail || firebaseUser.email === adminEmail) {
        router.push("/dashboard");
      } else {
        router.push("/member/dashboard");
      }
    } catch (err) {
      console.error("Redirect Error:", err);
    }
  };

  useEffect(() => {
    if (user && !isUserLoading) {
      checkRoleAndRedirect(user);
    }
  }, [user, isUserLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth!, email, password);
      toast({ title: "Login Berhasil" });
      await checkRoleAndRedirect(userCredential.user);
    } catch (error: any) {
      let message = "Email atau password salah.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') message = "Akun tidak ditemukan atau sandi salah.";
      toast({ variant: "destructive", title: "Login Gagal", description: message });
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Kosong",
        description: "Masukkan email Anda untuk menerima instruksi reset password.",
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth!, email);
      toast({
        title: "Email Terkirim",
        description: `Cek inbox ${email} untuk menyetel ulang sandi Anda.`,
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal Mengirim", description: "Pastikan email terdaftar." });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Wrench className="h-16 w-16 text-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 bg-secondary rounded-full animate-ping" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <p className="font-black uppercase tracking-[0.3em] text-xs">Menghubungkan Akun</p>
            <p className="text-muted-foreground text-[10px] font-bold animate-pulse">MOHON TUNGGU SEBENTAR...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 text-center bg-primary text-white pb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black tracking-tight uppercase">Akses Internal</CardTitle>
            <CardDescription className="text-white/70">Masuk untuk mengelola operasional atau cek status kendaraan</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</Label>
                <Input 
                  id="login-email"
                  name="email"
                  type="email" 
                  placeholder="admin@kargloss.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-12 border-2 rounded-xl" 
                  required 
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                  <button type="button" onClick={handleResetPassword} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter">
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <Input 
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="h-12 border-2 rounded-xl pr-12" 
                    required 
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-black uppercase tracking-tighter rounded-xl mt-6 shadow-xl" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Masuk Sekarang"}
              </Button>
            </form>

            <div className="mt-10 pt-6 border-t border-muted text-center">
              <Button asChild variant="ghost" className="w-full font-bold text-muted-foreground hover:text-primary rounded-xl">
                <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Beranda</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
