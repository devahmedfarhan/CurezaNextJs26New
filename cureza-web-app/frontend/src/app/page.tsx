import { Metadata } from 'next';
import faqsData from '@/data/home-faqs.json';
import HeroSlider from '@/components/home/HeroSlider';
import PioneeringBanner from '@/components/home/PioneeringBanner';
import FormulatedWithPurpose from '@/components/home/FormulatedWithPurpose';
import WatchAndExplore from '@/components/home/WatchAndExplore';
import PressMarquee from '@/components/home/PressMarquee';
import DoctorConsultationTimeline from '@/components/home/DoctorConsultationTimeline';
import PartnerShowcase from '@/components/home/PartnerShowcase';
import TestimonialSlider from '@/components/home/TestimonialSlider';
import FAQSection from '@/components/home/FAQSection';
import BlogList from '@/components/blogs/BlogList';
import ProductGrid from '@/components/product/ProductGrid';

export const metadata: Metadata = {
  title: "Cureza: Buy Medical Cannabis CBD, Ayurveda & Natural Wellness Online",
  description: "Cureza Marketplace is India's leading platform for clinical-grade CBD products, authentic Ayurvedic medicines, and organic wellness supplements verified by doctors.",
  alternates: {
    canonical: "https://cureza.in/",
  },
  openGraph: {
    title: "Cureza: Buy Medical Cannabis CBD, Ayurveda & Natural Wellness Online",
    description: "Cureza Marketplace is India's leading platform for clinical-grade CBD products, authentic Ayurvedic medicines, and organic wellness supplements verified by doctors.",
    url: "https://cureza.in/",
    siteName: "Cureza Marketplace",
    images: [
      {
        url: "/BannerPNG.png",
        width: 1200,
        height: 630,
        alt: "Cureza Marketplace Banner",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cureza: Buy Medical Cannabis CBD, Ayurveda & Natural Wellness Online",
    description: "Cureza Marketplace is India's leading platform for clinical-grade CBD products, authentic Ayurvedic medicines, and organic wellness supplements verified by doctors.",
    images: ["/BannerPNG.png"],
  },
};


// NEW & RESTYLED HOMEPAGE SECTIONS
import BrandBannerLayout from '@/components/home/BrandGrid';
import ConcernSlider from '@/components/home/ConcernSlider';
import CategorySlider from '@/components/home/CategorySlider';
import OffersSection from '@/components/home/OffersSection';
import DoctorQuickBook from '@/components/home/DoctorQuickBook';
import LabReportsChecker from '@/components/home/LabReportsChecker';
import CommunityCircleHighlight from '@/components/home/CommunityCircleHighlight';

// Landing Page Integrated Sections
import { SubscriptionRefillBanner } from '@/components/home-sections/Zone3_RxEngine';
import {
  SpectrumEducation,
  CBDDosageCalculator,
  VeterinaryDosageCalculator
} from '@/components/home-sections/Zone4_CBDHemp';
import {
  TeleconsultationBooking,
  SynergyBundles
} from '@/components/home-sections/Zone5_AyurvedaClinic';
import { IngredientGlossary } from '@/components/home-sections/Zone8_EducationalContent';
import {
  WhiteLabelAdvisory,
  SecureGatewayLogos
} from '@/components/home-sections/Zone10_FooterCompliance';
import {
  HempTruthMeter,
  HeritageTimeline,
  RatioNavigator,
  CropToDropTimeline,
  HempNutritionGrid,
  EcoImpactShowcase,
  SkincareBeautyStandard,
  QualityProtocolSeal,
  ClinicalTrustShowcase,
  SeenOnMediaShowers
} from '@/components/home-sections/Zone12_CompetitorInsights';


async function getSettings() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${backendUrl}/api/settings/public`, {
      next: { revalidate: 10 } // Revalidate every 10 seconds to reflect admin changes quickly
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('Failed to fetch public settings on home page:', error);
  }
  return {
    homepage_section_order: 'hero,stats,purpose,partners,consultation,testimonials,marquee'
  };
}

async function getProducts(params: { category?: string; collection?: string; limit?: number; mega_menu_section?: string }) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  const query = new URLSearchParams();
  if (params.limit) query.append('limit', String(params.limit));
  if (params.category) query.append('category', params.category);
  if (params.collection) query.append('collection', params.collection);
  if (params.mega_menu_section) query.append('mega_menu_section', params.mega_menu_section);


  try {
    const res = await fetch(`${backendUrl}/api/products?${query.toString()}`, {
      next: { revalidate: 300 } // Cache homepage products for 5 minutes
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch homepage products:', error);
  }
  return [];
}

export default async function Home() {
  const [
    settings,
    newArrivals,
    specialOffers,
    bestSellers,
    thcProducts,
    cbdHempProducts,
    herbalAyurvedaProducts,
    supplementsWellnessProducts
  ] = await Promise.all([
    getSettings(),
    getProducts({ category: 'latest-launch', limit: 8 }),
    getProducts({ collection: 'summer-sale', limit: 8 }),
    getProducts({ limit: 8 }),
    getProducts({ mega_menu_section: 'thc', limit: 8 }),
    getProducts({ mega_menu_section: 'cbd', limit: 8 }),
    getProducts({ mega_menu_section: 'herbal', limit: 8 }),
    getProducts({ mega_menu_section: 'supplements', limit: 8 })
  ]);



  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalOrganization",
      "@id": "https://cureza.in/#organization",
      "name": "Cureza Marketplace",
      "url": "https://cureza.in",
      "logo": "https://cureza.in/Logo%20Full.svg",
      "image": "https://cureza.in/BannerPNG.png",
      "description": "India's premier online marketplace for clinical-grade CBD products, authentic Ayurvedic medicines, and organic wellness supplements verified by doctors.",
      "telephone": "+91-9876543210",
      "email": "support@cureza.in",
      "medicalSpecialty": [
        "AyurvedicMedicine",
        "CannabisTherapeutics",
        "HolisticHealth"
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "102, Green Botanical Avenue, Sector 5",
        "addressLocality": "Bengaluru",
        "addressRegion": "Karnataka",
        "postalCode": "560001",
        "addressCountry": "IN"
      },
      "sameAs": [
        "https://www.facebook.com/curezamarketplace",
        "https://www.instagram.com/cureza_wellness",
        "https://x.com/curezain",
        "https://www.wikidata.org/wiki/Q114389"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://cureza.in/#website",
      "url": "https://cureza.in",
      "name": "Cureza Marketplace",
      "description": "Multi-Vendor Wellness Marketplace for CBD, Ayurveda & Natural supplements.",
      "publisher": {
        "@id": "https://cureza.in/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://cureza.in/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://cureza.in/#webpage",
      "url": "https://cureza.in",
      "name": "Cureza: Buy Medical Cannabis CBD, Ayurveda & Natural Wellness Online",
      "description": "Cureza Marketplace is India's leading platform for clinical-grade CBD products, authentic Ayurvedic medicines, and organic wellness supplements verified by doctors.",
      "isPartOf": {
        "@id": "https://cureza.in/#website"
      },
      "about": [
        {
          "@type": "Thing",
          "name": "Cannabidiol",
          "sameAs": "https://en.wikipedia.org/wiki/Cannabidiol"
        },
        {
          "@type": "Thing",
          "name": "Ayurveda",
          "sameAs": "https://en.wikipedia.org/wiki/Ayurveda"
        },
        {
          "@type": "Thing",
          "name": "Alternative Medicine",
          "sameAs": "https://en.wikipedia.org/wiki/Alternative_medicine"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://cureza.in"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqsData.map((faq: any) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    }
  ];

  return (
    <div className="w-full bg-[#F8F3EF]">
      {/* ENTERPRISE JSON-LD SCHEMAS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      {/* Accessibility & SEO Root Heading */}
      <h1 className="sr-only">
        Cureza Marketplace - Buy Medical Cannabis CBD, Ayurveda & Natural Wellness Online
      </h1>

      {/* 1. CINEMATIC HERO SLIDER */}
      <HeroSlider />

      {/* 2. BEST SELLERS & SALE (Sequential top grids) */}
      <div className="bg-[#F8F3EF] py-4">
        <ProductGrid
          title="Best Sellers"
          subtitle="Most loved by our community"
          layout="grid"
          columns={4}
          limit={8}
          products={bestSellers}
        />
      </div>

      {/* NEW ARRIVAL */}
      <div className="bg-white py-4 border-b border-[#052326]/5">
        <ProductGrid
          title="New Arrivals"
          subtitle="Freshly added wellness solutions to our catalog"
          layout="grid"
          columns={4}
          limit={8}
          categorySlug="latest-launch"
          products={newArrivals}
          viewAllLink="/shop?category=latest-launch"
        />
      </div>

      {/* MEDICAL CANNABIS THC */}
      <div className="bg-[#F8F3EF] py-4 border-b border-[#052326]/5">
        <ProductGrid
          title="Medical Cannabis THC"
          subtitle="Standardized THC formulations for professional care"
          layout="grid"
          columns={4}
          limit={8}
          products={thcProducts}
          viewAllLink="/shop?section=thc"
        />
      </div>

      {/* CBD & HEMP PRODUCTS */}
      <div className="bg-white py-4 border-b border-[#052326]/5">
        <ProductGrid
          title="CBD & Hemp Products"
          subtitle="High-quality CBD extracts and organic hemp formulations"
          layout="grid"
          columns={4}
          limit={8}
          products={cbdHempProducts}
          viewAllLink="/shop?section=cbd"
        />
      </div>

      {/* HERBAL & AYURVEDA */}
      <div className="bg-[#F8F3EF] py-4 border-b border-[#052326]/5">
        <ProductGrid
          title="Herbal & Ayurveda"
          subtitle="Traditional remedies rooted in classical Indian wellness"
          layout="grid"
          columns={4}
          limit={8}
          products={herbalAyurvedaProducts}
          viewAllLink="/shop?section=herbal"
        />
      </div>

      {/* SUPPLEMENTS & WELLNESS */}
      <div className="bg-white py-4 border-b border-[#052326]/5">
        <ProductGrid
          title="Supplements & Wellness"
          subtitle="Daily nutritional supplements and wellness essentials"
          layout="grid"
          columns={4}
          limit={8}
          products={supplementsWellnessProducts}
          viewAllLink="/shop?section=supplements"
        />
      </div>


      <div className="bg-[#052326]/5 py-4 border-y border-[#052326]/5">
        <ProductGrid
          title="Special Offers & Sales"
          subtitle="Featured collections and limited-time wellness deals"
          collectionSlug="summer-sale"
          columns={4}
          layout="carousel"
          products={specialOffers}
        />
      </div>


      {/* 4. SHOP BY BRAND */}
      <BrandBannerLayout />

      {/* 5. SHOP BY CONCERN */}
      <ConcernSlider />

      {/* 6. SHOP BY CATEGORY */}
      <CategorySlider />

      {/* NEW: Multi-Vertical Synergy & Clinical Integrative Bundles */}
      <SynergyBundles />

      {/* 7. OFFERS PAGES / DISCOUNT DECK */}
      <OffersSection />

      {/* NEW: Adherence Support Program & Scientific Breakdown (Stacked together) */}
      <SubscriptionRefillBanner />
      <SpectrumEducation />

      {/* --- BOTTOM SECTION: RETAINING ALL EXISTING SECTIONS & EXTRA WIDGETS BEFORE FAQ --- */}
      
      {/* 8. PIONEERING STATS BANNER */}
      <PioneeringBanner />

      {/* 9. FORMULATED WITH PURPOSE */}
      <FormulatedWithPurpose />

      {/* 10. WATCH & EXPLORE (SHOPPABLE VIDEO CAROUSEL) */}
      <WatchAndExplore />

      {/* 11. RECOGNIZED. REWARDED. (PRESS MARQUEE) */}
      <PressMarquee />

      {/* 12. CLINICAL PATHWAY CONSULTATION TIMELINE */}
      <DoctorConsultationTimeline />

      {/* 13. DOCTOR QUICK BOOKING CLINIC WIDGET */}
      <DoctorQuickBook />

      {/* NEW: Medical Validation & Regulated Telemedicine: Registered AYUSH Doctors */}
      <TeleconsultationBooking />

      {/* 14. CERTIFICATE OF ANALYSIS (COA) / LAB REPORTS CHECKER */}
      <LabReportsChecker />

      {/* NEW: Clinical & Veterinary Dosage Calculators */}
      <CBDDosageCalculator />
      <VeterinaryDosageCalculator />

      {/* 15. CUREZA CIRCLE DISCUSSION BOARD */}
      <CommunityCircleHighlight />

      {/* NEW: Molecular Glossary & The Interactive Ingredient Glossary */}
      <IngredientGlossary />

      {/* 16. PARTNER SHOWCASE */}
      <PartnerShowcase />

      {/* NEW: White-Label Formulation Consulting */}
      <WhiteLabelAdvisory />

      {/* 17. TESTIMONIAL SLIDER */}
      <TestimonialSlider />

      {/* 18. KNOWLEDGE HUB - RECENT INSIGHTS */}
      <div className="bg-[#F8F3EF] py-20">
        <BlogList
          categories={['ayurveda', 'wellness']}
          limit={3}
          grid={3}
          isDarkBg={false}
        />
      </div>

      {/* 19. FAQ SECTION */}
      <div className="bg-[#F8F3EF] py-16 border-t border-[#052326]/5">
        <FAQSection />
      </div>

      {/* COMPETITOR-INSPIRED PREMIUM SECTIONS */}
      <HempTruthMeter />
      <HeritageTimeline />
      <RatioNavigator />
      <CropToDropTimeline />
      <HempNutritionGrid />
      <EcoImpactShowcase />
      <SkincareBeautyStandard />
      <QualityProtocolSeal />
      <ClinicalTrustShowcase />
      <SeenOnMediaShowers />

      {/* NEW: Verified Compliant High-Risk Settlement Gateway */}
      <SecureGatewayLogos />
    </div>

  );
}

