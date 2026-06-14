
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MapPin, ArrowRight, Navigation, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function Hero() {
  const db = useFirestore();
  const { toast } = useToast();
  const [currentSubDistrict, setCurrentSubDistrict] = useState("Purwokerto Utara");
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Fetch dynamic branding from Firestore
  const generalSettingsRef = useMemoFirebase(() => doc(db, "siteSettings", "general"), [db]);
  const { data: generalSettings } = useDoc(generalSettingsRef);

  const heroImage = PlaceHolderImages.find(img => img.id === "hero")!;
  const displayHeroUrl = generalSettings?.heroImageUrl || heroImage.imageUrl;

  useEffect(() => {
    async function fetchInitialLocation() {
      const subDistricts = ["Bobosan", "Purwanegara", "Pabuaran", "Grendeng", "Sumampir"];
      const randomSub = subDistricts[Math.floor(Math.random() * subDistricts.length)];
      setCurrentSubDistrict(randomSub);
      setLoading(false);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    fetchInitialLocation();

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({ 
        variant: "destructive",
        title: "Tidak Didukung", 
        description: "Browser Anda tidak mendukung fitur deteksi lokasi." 
      });
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          const detectedSub = data.address?.village || data.address?.suburb || data.address?.neighbourhood || "Purwanegara";
          
          setCurrentSubDistrict(detectedSub);
          
          toast({ 
            title: "Lokasi Berhasil Dikenali", 
            description: `Menampilkan layanan khusus untuk area: ${detectedSub}` 
          });
        } catch (error) {
          console.error("Error identifying area:", error);
          toast({ 
            variant: "destructive", 
            title: "Gagal Mengenali Area", 
            description: "Gagal mengambil informasi area dari GPS Anda." 
          });
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        setDetecting(false);
        toast({ 
          variant: "destructive", 
          title: "Akses Lokasi Ditolak", 
          description: "Mohon izinkan akses lokasi pada browser Anda agar kami dapat mengenali area Anda." 
        });
      }
    );
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Cara Instalasi",
        description: "Untuk iOS: Tap ikon 'Share' lalu pilih 'Add to Home Screen'. Untuk Chrome: Klik ikon install di bar alamat.",
      });
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      toast({ title: "Terima Kasih!", description: "Aplikasi sedang diinstal ke perangkat Anda." });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-start md:items-center overflow-x-hidden pt-20 md:pt-0">
      <div className="absolute inset-0 z-0">
        <Image
          src={displayHeroUrl}
          alt={heroImage.description}
          fill
          className="object-cover brightness-[0.25]"
          priority
          data-ai-hint={heroImage.imageHint}
          unoptimized={!!generalSettings?.heroImageUrl}
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-12 md:py-24">
        <div className="max-w-4xl space-y-6 md:space-y-10">
          <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="inline-flex items-center space-x-2 bg-secondary/20 border border-secondary/30 text-secondary px-4 py-1.5 rounded-full text-[10px] md:text-sm font-semibold backdrop-blur-sm">
              <MapPin className="h-3 w-3 md:h-4 md:w-4" />
              <span>{loading ? "Mendeteksi..." : `Area ${currentSubDistrict}`}</span>
            </div>
            
            <button 
              onClick={handleDetectLocation} 
              disabled={detecting}
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-1.5 rounded-full text-[10px] md:text-sm font-semibold backdrop-blur-sm transition-all disabled:opacity-50"
            >
              {detecting ? <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : <Navigation className="h-3 w-3 md:h-4 md:w-4" />}
              <span>{detecting ? "Mencari..." : "Gunakan GPS"}</span>
            </button>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-headline font-black text-white leading-[1.1] tracking-tighter">
            <span className="block opacity-90">Kargloss Autocare</span>
            <div className="mt-4 md:mt-8 text-xl sm:text-2xl md:text-4xl lg:text-5xl text-secondary font-bold tracking-normal">
              Auto Detailing | Salon Mobil
            </div>
          </h1>
          
          <p className="text-sm md:text-xl text-gray-300 max-w-2xl leading-relaxed font-medium">
            Berikan kilau sempurna dan perlindungan maksimal untuk kendaraan kesayangan Anda di {currentSubDistrict}.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg md:text-xl font-black h-14 md:h-16 px-8 md:px-10 rounded-2xl shadow-2xl shadow-secondary/20" asChild>
              <a href="https://wa.me/+628112612237" target="_blank" rel="noopener noreferrer">
                BOOKING SEKARANG <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="ghost" 
              className="border-2 border-white text-white hover:bg-white/10 text-lg md:text-xl font-black h-14 md:h-16 px-8 md:px-10 rounded-2xl backdrop-blur-md" 
              onClick={handleInstallClick}
            >
              Install Aplikasi
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
