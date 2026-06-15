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

export default function Home() {
  return (
    <div className="w-full bg-[#F8F3EF]">

      {/* 1. CINEMATIC HERO SLIDER */}
      <HeroSlider />

      {/* 2. CARE FOR YOUR CONCERN (HEALTH CATEGORIES CIRCLE GRID) */}
      <ShopByTabs />

      {/* 3. PIONEERING STATS BANNER */}
      <PioneeringBanner />

      {/* 4. FORMULATED WITH PURPOSE (SCIENTIFIC EXTRACTION PANELS) */}
      <FormulatedWithPurpose />

      {/* 5. WATCH & EXPLORE (SHOPPABLE VIDEO CAROUSEL) */}
      <WatchAndExplore />

      {/* 6. RECOGNIZED. REWARDED. (PRESS LOGO SLIDER) */}
      <PressMarquee />

      {/* 7. RX DOCTOR CONSULTATION TIMELINE */}
      <DoctorConsultationTimeline />

      {/* 8. PARTNER WITH CUREZA / SELL ON CUREZA */}
      <PartnerShowcase />

      {/* 9. NEW LAUNCHES (Dynamic Grid from DB) */}
      <div className="bg-white py-16">
        <ProductGrid
          title="New Launches"
          subtitle="Exclusive new arrivals added this week"
          columns={4}
          categorySlug="latest-launch"
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
        />
      </div>

      {/* 11. CUSTOMER TESTIMONIALS SLIDER */}
      <TestimonialSlider />

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
