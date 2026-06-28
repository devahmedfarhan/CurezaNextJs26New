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

// NEW & RESTYLED HOMEPAGE SECTIONS
import BrandBannerLayout from '@/components/home/BrandGrid';
import ConcernSlider from '@/components/home/ConcernSlider';
import CategorySlider from '@/components/home/CategorySlider';
import OffersSection from '@/components/home/OffersSection';
import DoctorQuickBook from '@/components/home/DoctorQuickBook';
import LabReportsChecker from '@/components/home/LabReportsChecker';
import CommunityCircleHighlight from '@/components/home/CommunityCircleHighlight';

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

async function getProducts(params: { category?: string; collection?: string; limit?: number }) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  const query = new URLSearchParams();
  if (params.limit) query.append('limit', String(params.limit));
  if (params.category) query.append('category', params.category);
  if (params.collection) query.append('collection', params.collection);

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
  const [settings, newLaunches, specialOffers, bestSellers] = await Promise.all([
    getSettings(),
    getProducts({ category: 'latest-launch', limit: 8 }),
    getProducts({ collection: 'summer-sale', limit: 8 }),
    getProducts({ limit: 8 })
  ]);

  return (
    <div className="w-full bg-[#F8F3EF]">
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

      {/* 3. FEATURED & NEW ARRIVALS */}
      <div className="bg-white py-4">
        <ProductGrid
          title="New Launches"
          subtitle="Exclusive new arrivals added this week"
          columns={4}
          categorySlug="latest-launch"
          products={newLaunches}
        />
      </div>

      {/* 4. SHOP BY BRAND */}
      <BrandBannerLayout />

      {/* 5. SHOP BY CONCERN */}
      <ConcernSlider />

      {/* 6. SHOP BY CATEGORY */}
      <CategorySlider />

      {/* 7. OFFERS PAGES / DISCOUNT DECK */}
      <OffersSection />

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

      {/* 14. CERTIFICATE OF ANALYSIS (COA) / LAB REPORTS CHECKER */}
      <LabReportsChecker />

      {/* 15. CUREZA CIRCLE DISCUSSION BOARD */}
      <CommunityCircleHighlight />

      {/* 16. PARTNER SHOWCASE */}
      <PartnerShowcase />

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
    </div>
  );
}
