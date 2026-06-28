import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import HerbsList from './HerbsList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Herbs A to Z | Cureza Wellness Herbs Library',
  description: 'Learn about medicinal uses of herbs A-Z, their botanical classifications, Ayurvedic properties (Rasa, Guna, Virya, Vipaka) and dosages.',
};

export default function HerbsLibraryPage() {
  const jsonPath = path.join(process.cwd(), 'public/data/herbs.json');
  let herbs = [];

  if (fs.existsSync(jsonPath)) {
    try {
      const rawData = fs.readFileSync(jsonPath, 'utf8');
      const fullData = JSON.parse(rawData);
      // Map to lightweight items for listing payload efficiency
      herbs = fullData.map((herb: any) => ({
        name: herb.name,
        slug: herb.slug,
        title: herb.title,
        featured_image: herb.featured_image || "",
      }));
    } catch (error) {
      console.error("Error reading herbs data file:", error);
    }
  }

  return (
    <div className="bg-stone-50/40 dark:bg-gray-950 min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex gap-2 items-center">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/wellness-library" className="hover:text-emerald-600 transition-colors">Wellness Library</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-300 font-semibold">Herbs A-Z</span>
        </nav>

        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Natural Remedies
          </span>
          <h1 className="text-4xl font-extrabold text-gray-950 dark:text-white mt-4 tracking-tight font-heading">
            Cureza Wellness Herbs Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm leading-relaxed">
            Explore our curated database of traditional herbs, researched and structured to understand their botanical classification, therapeutic properties, shlokas, and safe dosages.
          </p>
        </div>

        {/* Client side listing + search + filters */}
        <HerbsList herbs={herbs} />
      </div>
    </div>
  );
}
