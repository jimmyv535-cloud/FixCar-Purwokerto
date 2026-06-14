"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GenerateLocalContentOutput } from "@/ai/flows/admin-local-content-generator";
import { Sparkles, Droplets, ShieldCheck, MapPin } from "lucide-react";

interface LocalContentSectionProps {
  content: GenerateLocalContentOutput | null;
}

export function LocalContentSection({ content }: LocalContentSectionProps) {
  if (!content) return null;

  // Simple parsing for bullet points if present in AI output
  const sections = content.textSnippet.split('\n\n');
  const intro = sections[0];
  const detailBody = sections.slice(1).join('\n\n');

  return (
    <section className="py-16 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
              <MapPin className="h-4 w-4" />
              <span>Kabar Purwokerto Utara</span>
            </div>
            <h2 className="text-3xl font-headline font-black text-primary leading-tight">
              {content.mainHeading}
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground/80">{intro}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-md bg-muted/20">
              <CardContent className="pt-6 space-y-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <h3 className="font-bold text-lg">Auto Detailing</h3>
                <p className="text-sm text-muted-foreground">Pembersihan mendalam hingga ke pori-pori terkecil untuk mengembalikan kemewahan mobil Anda.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-muted/20">
              <CardContent className="pt-6 space-y-3">
                <Droplets className="h-8 w-8 text-primary" />
                <h3 className="font-bold text-lg">Cuci Premium</h3>
                <p className="text-sm text-muted-foreground">Proses teliti dengan sampo pH netral untuk menghindari baret halus pada cat kendaraan.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-muted/20">
              <CardContent className="pt-6 space-y-3">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <h3 className="font-bold text-lg">Paint Protection</h3>
                <p className="text-sm text-muted-foreground">Lapisan pelindung kuat (Wax/Coating) untuk menjaga kilap tahan lama dari cuaca ekstrem.</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
            <div className="prose prose-blue max-w-none text-primary/80 leading-relaxed whitespace-pre-wrap">
              {detailBody || content.seoDescription}
            </div>
          </div>

          {content.localRecommendations && content.localRecommendations.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-bold text-primary">Tips Perawatan Mobil Lokal:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.localRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl border shadow-sm">
                    <div className="bg-secondary rounded-full p-1 mt-1">
                      <ShieldCheck className="h-3 w-3 text-secondary-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
