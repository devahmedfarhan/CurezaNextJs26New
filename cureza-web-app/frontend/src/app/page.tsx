import HeroSlider from '@/components/home/HeroSlider';
import ShopByTabs from '@/components/home/ShopByTabs';
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
  const sectionOrder = (settings.homepage_section_order || 'hero,stats,purpose,partners,consultation,testimonials,marquee').split(',');

  return (
    <div className="w-full bg-[#F8F3EF]">
      {sectionOrder.map((sectionKey: string) => {
        switch (sectionKey.trim()) {
          case 'hero':
            return (
              <div key="hero-section">
                {/* 1. CINEMATIC HERO SLIDER */}
                <HeroSlider />
                {/* 2. CARE FOR YOUR CONCERN (HEALTH CATEGORIES CIRCLE GRID) */}
                <ShopByTabs />
              </div>
            );
          case 'stats':
            return <PioneeringBanner key="stats-section" />;
          case 'purpose':
            return <FormulatedWithPurpose key="purpose-section" />;
          case 'marquee':
            return (
              <div key="marquee-section">
                {/* 5. WATCH & EXPLORE (SHOPPABLE VIDEO CAROUSEL) */}
                <WatchAndExplore />
                {/* 6. RECOGNIZED. REWARDED. (PRESS LOGO SLIDER) */}
                <PressMarquee />
              </div>
            );
          case 'consultation':
            return <DoctorConsultationTimeline key="consultation-section" />;
          case 'partners':
            return <PartnerShowcase key="partners-section" />;
          case 'testimonials':
            return <TestimonialSlider key="testimonials-section" />;
          default:
            return null;
        }
      })}

      {/* 9. NEW LAUNCHES (Dynamic Grid from DB) */}
      <div className="bg-white py-16">
        <ProductGrid
          title="New Launches"
          subtitle="Exclusive new arrivals added this week"
          columns={4}
          categorySlug="latest-launch"
          products={newLaunches}
        />
      </div>

      {/* 9.5 SPECIAL OFFERS (Dynamic Collection from DB) */}
      <div className="bg-[#052326]/5 py-16 border-y border-[#052326]/5">
        <ProductGrid
          title="Special Offers & Sales"
          subtitle="Featured collections and limited-time wellness deals"
          collectionSlug="summer-sale"
          columns={4}
          layout="carousel"
          products={specialOffers}
        />
      </div>

      {/* 10. BEST SELLERS (Grid) */}
      <div className="bg-[#F8F3EF] py-16">
        <ProductGrid
          title="Best Sellers"
          subtitle="Most loved by our community"
          layout="grid"
          columns={4}
          limit={8}
          products={bestSellers}
        />
      </div>

      {/* 12. FAQ SECTION */}
      <div className="bg-[#F8F3EF] py-16 border-t border-[#052326]/5">
        <FAQSection />
      </div>

      {/* 13. KNOWLEDGE HUB - RECENT INSIGHTS */}
      <div className="bg-[#F8F3EF] py-20">
        <BlogList
          categories={['ayurveda', 'wellness']}
          limit={3}
          grid={3}
          isDarkBg={false}
        />
      </div>
    </div>
  );
}
