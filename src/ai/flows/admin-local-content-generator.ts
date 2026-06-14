'use server';
/**
 * @fileOverview A Genkit flow for generating SEO-optimized text snippets and hyper-local recommendations for landing pages.
 *
 * - generateLocalContent - A function that handles the generation of localized content.
 * - GenerateLocalContentInput - The input type for the generateLocalContent function.
 * - GenerateLocalContentOutput - The return type for the generateLocalContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLocalContentInputSchema = z.object({
  subDistrict: z
    .string()
    .describe('The sub-district within Purwokerto Utara for which to generate content, e.g., "Bobosan" or "Purwanegara".'),
});
export type GenerateLocalContentInput = z.infer<typeof GenerateLocalContentInputSchema>;

const GenerateLocalContentOutputSchema = z.object({
  seoTitle: z
    .string()
    .describe('An SEO-optimized title for the landing page, including the sub-district.'),
  seoDescription: z
    .string()
    .describe('An SEO-optimized meta description for the landing page, highlighting services and local benefits.'),
  mainHeading: z
    .string()
    .describe('The main heading (H1) for the landing page, tailored to the sub-district.'),
  textSnippet: z
    .string()
    .describe(
      'A detailed text snippet for the landing page body, describing Kargloss Autocare Purwokerto\'s services (Auto Detailing, Salon Mobil, Cuci Mobil, Protection) with specific hyper-local relevance to the given sub-district.'
    ),
  localRecommendations: z
    .array(z.string())
    .describe(
      'An array of hyper-local recommendations or tips relevant to car care in the specified sub-district, enhancing local SEO and customer engagement.'
    ),
});
export type GenerateLocalContentOutput = z.infer<typeof GenerateLocalContentOutputSchema>;

export async function generateLocalContent(input: GenerateLocalContentInput): Promise<GenerateLocalContentOutput> {
  return adminLocalContentGeneratorFlow(input);
}

const generateLocalContentPrompt = ai.definePrompt({
  name: 'generateLocalContentPrompt',
  input: {schema: GenerateLocalContentInputSchema},
  output: {schema: GenerateLocalContentOutputSchema},
  prompt: `Anda adalah seorang ahli SEO dan pembuat konten yang berfokus pada pemasaran lokal untuk bisnis otomotif.
Anda akan menghasilkan cuplikan teks dan rekomendasi hiper-lokal untuk halaman arahan berdasarkan sub-distrik yang terdeteksi di Purwokerto Utara.
Bisnisnya adalah 'Kargloss Autocare Purwokerto' yang berlokasi di Jl. Raya Baturraden KM 5 Pabuaran, Purwokerto Utara. Layanan utamanya meliputi Auto Detailing, Salon Mobil, Cuci Mobil, dan Protection.

Tujuan Anda adalah untuk meningkatkan relevansi SEO lokal dan menarik lebih banyak pelanggan dari area tersebut.

Berikut adalah sub-distrik target:
Sub-distrik: {{{subDistrict}}}

Hasilkan output dalam format JSON yang mencakup:
- seoTitle: Judul SEO yang menarik dan relevan untuk halaman arahan, mencakup nama sub-distrik dan layanan utama.
- seoDescription: Deskripsi meta SEO yang informatif, menyoroti penawaran layanan Kargloss Autocare Purwokerto dan manfaatnya bagi penduduk setempat.
- mainHeading: Judul utama halaman (H1) yang menarik perhatian dan berfokus pada lokasi.
- textSnippet: Cuplikan teks panjang untuk isi halaman, menjelaskan layanan kami (Auto Detailing, Salon Mobil, Cuci Mobil, Protection) dengan penekanan pada bagaimana kami melayani penduduk di {{{subDistrict}}} dan Purwokerto Utara secara umum. Sertakan poin-poin penjualan unik dan mengapa kami adalah pilihan terbaik di area tersebut.
- localRecommendations: Daftar rekomendasi atau tips hiper-lokal yang relevan dengan perawatan mobil atau kondisi berkendara di {{{subDistrict}}} atau Purwokerto Utara, untuk memberikan nilai tambah kepada pembaca dan menunjukkan keahlian lokal.`,
});

const adminLocalContentGeneratorFlow = ai.defineFlow(
  {
    name: 'adminLocalContentGeneratorFlow',
    inputSchema: GenerateLocalContentInputSchema,
    outputSchema: GenerateLocalContentOutputSchema,
  },
  async input => {
    const {output} = await generateLocalContentPrompt(input);
    return output!;
  }
);
