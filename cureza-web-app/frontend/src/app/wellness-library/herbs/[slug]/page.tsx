import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Layers, ShieldAlert, Heart, Calendar } from 'lucide-react';
import { Metadata } from 'next';

interface Section {
  title: string;
  content: string;
}

interface HerbData {
  name: string;
  slug: string;
  title: string;
  featured_image: string;
  url: string;
  properties_structured: Record<string, { english?: string; sanskrit?: string; value?: string }>;
  sections: Record<string, Section>;
}

// Generate metadata for each page dynamically
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const herb = getHerbData(slug);
  if (!herb) {
    return {
      title: 'Herb Not Found | Cureza Wellness Herbs Library',
    };
  }
  return {
    title: `${herb.name.split('/')[0].trim()} - Uses, Benefits, Dosage | Cureza Wellness`,
    description: `Learn about ${herb.name}. Explore its Ayurvedic properties, therapeutic benefits, classification, shlokas, and recommended dosages.`,
  };
}

// Pre-generate routes for all herbs (static rendering)
export async function generateStaticParams() {
  const jsonPath = path.join(process.cwd(), 'public/data/herbs.json');
  if (!fs.existsSync(jsonPath)) return [];
  
  try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const fullData = JSON.parse(rawData);
    return fullData.map((herb: any) => ({
      slug: herb.slug,
    }));
  } catch (e) {
    console.error("Error generating static params:", e);
    return [];
  }
}

function cleanContentImages(htmlContent: string): string {
  if (!htmlContent) return htmlContent;
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let cleanedHtml = htmlContent;
  
  let match;
  const matches: { tag: string; src: string }[] = [];
  
  const localRegex = new RegExp(imgRegex);
  while ((match = localRegex.exec(htmlContent)) !== null) {
    matches.push({
      tag: match[0],
      src: match[1]
    });
  }
  
  for (const m of matches) {
    if (m.src.startsWith('/images/herbs/')) {
      const diskPath = path.join(process.cwd(), 'public', m.src);
      if (!fs.existsSync(diskPath)) {
        cleanedHtml = cleanedHtml.replace(m.tag, '');
      }
    }
  }
  return cleanedHtml;
}

function getHerbData(slug: string): HerbData | null {
  const jsonPath = path.join(process.cwd(), 'public/data/herbs.json');
  if (!fs.existsSync(jsonPath)) return null;
  
  try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const fullData: HerbData[] = JSON.parse(rawData);
    const herb = fullData.find(h => h.slug === slug) || null;
    if (herb) {
      for (const key of Object.keys(herb.sections)) {
        herb.sections[key].content = cleanContentImages(herb.sections[key].content);
      }
    }
    return herb;
  } catch {
    return null;
  }
}

export default async function HerbDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const herb = getHerbData(slug);

  if (!herb) {
    notFound();
  }

  // Check if featured image exists on disk
  let featuredImageExists = false;
  if (herb.featured_image) {
    const absoluteImagePath = path.join(process.cwd(), 'public', herb.featured_image);
    if (fs.existsSync(absoluteImagePath)) {
      featuredImageExists = true;
    }
  }

  // Parse botanical name from herb title/name if possible
  let botanicalName = "";
  const match = herb.name.match(/\(([^)]+)\)/) || herb.title.match(/\(([^)]+)\)/);
  if (match) {
    botanicalName = match[1];
  } else {
    const parts = herb.name.split('/');
    if (parts.length >= 3) {
      botanicalName = parts[2].trim();
    }
  }

  // Common name representation
  const commonName = herb.name.split('/')[0].trim();

  // Create categorized lists of sections to show in layout groups
  const sectionsKeys = Object.keys(herb.sections);
  
  // Group sections by sidebars categories
  const overviewKeys = ['introduction', 'general_info', 'special_note_about_this_plant', 'special_note_about_madar_plant'];
  const scientificKeys = ['classification', 'scientific_classification', 'scientific_synonyms', 'habitat', 'habitat_of_ginger_plant', 'other_names', 'names', 'varities'];
  const ayurvedaKeys = ['properties', 'ayurvedic_properties', 'dosha_effects', 'effects_on_doshas', 'ancient_verse', 'reference_of_ancient_text_rajnighantu', 'references', 'classical_categorization'];
  const clinicalKeys = ['medicinal_uses', 'practical_uses', 'practical_uses_of_ginger', 'side_effects', 'word_of_caution', 'products', 'ayurvedic_products', 'dosage', 'parts_used', 'part_used'];

  // Check which keys actually exist in this herb
  const hasSections = (keysList: string[]) => keysList.some(k => sectionsKeys.includes(k));

  return (
    <div className="bg-stone-50/40 dark:bg-gray-950 min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 md:px-6">
        {/* Back Link */}
        <Link 
          href="/wellness-library/herbs" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={16} /> Back to Herbs Directory
        </Link>

        {/* Hero Card Panel */}
        <div className="bg-white dark:bg-gray-900 border border-stone-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 mb-8 shadow-sm flex flex-col md:flex-row gap-8">
          {/* Info Side */}
          <div className="flex-grow flex flex-col justify-between">
            <div>
              <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Herb Monograph
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 dark:text-white mt-4 font-heading tracking-tight">
                {commonName}
              </h1>
              {botanicalName && (
                <p className="text-lg italic text-emerald-600 dark:text-emerald-400 mt-2 font-serif">
                  {botanicalName}
                </p>
              )}
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 leading-relaxed font-sans max-w-xl">
                {herb.title}
              </p>
            </div>

            {/* Ayurvedic Properties Chips */}
            {Object.keys(herb.properties_structured).length > 0 && (
              <div className="mt-8 pt-6 border-t border-stone-100 dark:border-gray-800">
                <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">Ayurvedic Core Attributes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(herb.properties_structured).map(([key, data]) => {
                    if (key.toLowerCase().includes('sanskrit') || key.toLowerCase().includes('hindi')) return null;
                    const val = data.english || data.value || "";
                    if (!val) return null;
                    return (
                      <div key={key} className="bg-stone-50 dark:bg-gray-850 p-2.5 rounded-lg border border-stone-100/50 dark:border-gray-800/40">
                        <span className="block text-[10px] text-gray-400 font-bold uppercase">{key}</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Image Side */}
          {featuredImageExists && (
            <div className="w-full md:w-80 flex-shrink-0 flex items-center justify-center p-4 bg-stone-50 dark:bg-gray-850 rounded-xl border border-stone-100/50 dark:border-gray-800/40 min-h-[220px]">
              <img
                src={herb.featured_image}
                alt={herb.name}
                className="max-h-64 max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Detail Contents with Sticky Left Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Navigation Menu (Sticky) */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-6 bg-white dark:bg-gray-900 border border-stone-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm space-y-2">
              <h2 className="text-xs uppercase tracking-wider font-bold text-gray-400 px-3 mb-4">Contents</h2>
              
              {hasSections(overviewKeys) && (
                <a href="#overview-section" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-stone-50 dark:hover:bg-gray-850 rounded-lg transition-colors font-medium">
                  <BookOpen size={16} className="text-emerald-600" /> Monograph Overview
                </a>
              )}
              {hasSections(scientificKeys) && (
                <a href="#scientific-section" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-stone-50 dark:hover:bg-gray-850 rounded-lg transition-colors font-medium">
                  <Layers size={16} className="text-emerald-600" /> Taxonomy & Habitat
                </a>
              )}
              {hasSections(ayurvedaKeys) && (
                <a href="#ayurvedic-section" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-stone-50 dark:hover:bg-gray-850 rounded-lg transition-colors font-medium">
                  <Heart size={16} className="text-emerald-600" /> Ayurvedic Properties
                </a>
              )}
              {hasSections(clinicalKeys) && (
                <a href="#clinical-section" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-stone-50 dark:hover:bg-gray-850 rounded-lg transition-colors font-medium">
                  <ShieldAlert size={16} className="text-emerald-600" /> Medicinal & Dosages
                </a>
              )}
            </div>
          </div>

          {/* Right Contents */}
          <div className="flex-grow space-y-8 max-w-full overflow-hidden">
            
            {/* Overview Group */}
            {hasSections(overviewKeys) && (
              <div id="overview-section" className="bg-white dark:bg-gray-900 border border-stone-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-950 dark:text-white pb-3 border-b border-stone-100 dark:border-gray-800 mb-6 font-heading flex items-center gap-2">
                  <BookOpen size={20} className="text-emerald-600" /> Monograph Overview
                </h2>
                
                <div className="space-y-6">
                  {overviewKeys.map(k => {
                    const sec = herb.sections[k];
                    if (!sec) return null;
                    return (
                      <div key={k} className="herb-rich-content">
                        {k !== 'introduction' && <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{sec.title}</h3>}
                        <div 
                          dangerouslySetInnerHTML={{ __html: sec.content }}
                          className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 space-y-4
                            [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-gray-600 [&_p]:dark:text-gray-400 [&_p]:text-sm
                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-2 [&_li]:text-sm [&_li]:text-gray-600 [&_li]:dark:text-gray-400 [&_li]:leading-relaxed
                            [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:mx-auto [&_img]:my-4"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scientific Classification Group */}
            {hasSections(scientificKeys) && (
              <div id="scientific-section" className="bg-white dark:bg-gray-900 border border-stone-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-950 dark:text-white pb-3 border-b border-stone-100 dark:border-gray-800 mb-6 font-heading flex items-center gap-2">
                  <Layers size={20} className="text-emerald-600" /> Taxonomy & Habitat
                </h2>
                
                <div className="space-y-8">
                  {scientificKeys.map(k => {
                    const sec = herb.sections[k];
                    if (!sec) return null;
                    return (
                      <div key={k}>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">{sec.title}</h3>
                        <div 
                          dangerouslySetInnerHTML={{ __html: sec.content }}
                          className="text-sm leading-relaxed text-gray-700 dark:text-gray-300
                            [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-gray-600 [&_p]:dark:text-gray-400 [&_p]:text-sm
                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-2 [&_li]:text-sm [&_li]:text-gray-600 [&_li]:dark:text-gray-400 [&_li]:leading-relaxed
                            [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:mx-auto [&_img]:my-4"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ayurvedic Properties Group */}
            {hasSections(ayurvedaKeys) && (
              <div id="ayurvedic-section" className="bg-white dark:bg-gray-900 border border-stone-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-950 dark:text-white pb-3 border-b border-stone-100 dark:border-gray-800 mb-6 font-heading flex items-center gap-2">
                  <Heart size={20} className="text-emerald-600" /> Ayurvedic Properties & Verses
                </h2>
                
                <div className="space-y-8">
                  {ayurvedaKeys.map(k => {
                    const sec = herb.sections[k];
                    if (!sec) return null;
                    return (
                      <div key={k} className="border-b last:border-0 border-stone-50 dark:border-gray-850 pb-6 last:pb-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">{sec.title}</h3>
                        <div 
                          dangerouslySetInnerHTML={{ __html: sec.content }}
                          className="text-sm leading-relaxed text-gray-700 dark:text-gray-300
                            [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-gray-600 [&_p]:dark:text-gray-400 [&_p]:text-sm
                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-2 [&_li]:text-sm [&_li]:text-gray-600 [&_li]:dark:text-gray-400 [&_li]:leading-relaxed
                            [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:bg-emerald-50/50 [&_th]:dark:bg-emerald-950/20 [&_th]:p-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_th]:text-emerald-800 [&_th]:dark:text-emerald-400 [&_td]:p-3 [&_td]:border-b [&_td]:border-stone-100 [&_td]:dark:border-gray-800 [&_td]:text-sm [&_td]:text-gray-600 [&_td]:dark:text-gray-400
                            [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:mx-auto [&_img]:my-4"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clinical Actions & Cautions Group */}
            {hasSections(clinicalKeys) && (
              <div id="clinical-section" className="bg-white dark:bg-gray-900 border border-stone-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-950 dark:text-white pb-3 border-b border-stone-100 dark:border-gray-800 mb-6 font-heading flex items-center gap-2">
                  <ShieldAlert size={20} className="text-emerald-600" /> Medicinal Actions, Cautions & Dosage
                </h2>
                
                <div className="space-y-8">
                  {clinicalKeys.map(k => {
                    const sec = herb.sections[k];
                    if (!sec) return null;
                    
                    // Highlight caution sections visually with styling classes
                    const isCaution = k.includes('caution') || k.includes('side_effects');
                    
                    return (
                      <div 
                        key={k} 
                        className={`rounded-xl p-4 ${
                          isCaution 
                            ? 'bg-amber-50/60 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30' 
                            : 'border-b last:border-0 border-stone-50 dark:border-gray-850 pb-6 last:pb-0'
                        }`}
                      >
                        <h3 className={`text-base font-bold mb-3 ${isCaution ? 'text-amber-800 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                          {sec.title}
                        </h3>
                        <div 
                          dangerouslySetInnerHTML={{ __html: sec.content }}
                          className={`text-sm leading-relaxed ${isCaution ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'}
                            [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-sm
                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-2 [&_li]:text-sm [&_li]:leading-relaxed
                            [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:mx-auto [&_img]:my-4`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
