import HeroSlider from '@/components/home/HeroSlider';
import ShopByTabs from '@/components/home/ShopByTabs';
import OfferBanners from '@/components/home/OfferBanners';
import { SellerBannerStrip } from '@/components/home/BannerStrips';
import FAQSection from '@/components/home/FAQSection';
import BlogList from '@/components/blogs/BlogList';
import WellnessMarquee from '@/components/home/WellnessMarquee';
import BrandGrid from '@/components/home/BrandGrid';
import ProductGrid from '@/components/product/ProductGrid';

export default function Home() {
  return (
    <div className="w-full">

      {/* ---------------- 1. HERO SLIDER — DARK ---------------- */}
      <div>
        <HeroSlider />
      </div>

      {/* ---------------- 2. SHOP BY TABS — WHITE ---------------- */}
      <div className="bg-white py-10">
        <ShopByTabs />
      </div>

      {/* ---------------- 3. WELLNESS MARQUEE — WHITE ---------------- */}
      <div className="">
        <WellnessMarquee />
      </div>

      {/* ---------------- 4. BRAND GRID ---------------- */}
      <div className="py-10">
        <BrandGrid />
      </div>

      {/* ---------------- 5. OFFER BANNERS — DARK ---------------- */}
      <div className="bg-gray-50">
        <OfferBanners />
      </div>

      {/* ---------------- 6. NEW LAUNCHES (DB Data) ---------------- */}
      <div className="bg-white">
        <ProductGrid
          title="New Launches"
          subtitle="Exclusive new arrivals from Noelle Rosa"
          columns={4}
          categorySlug='latest-launch'
        />
      </div>

      {/* ---------------- 7. BEST SELLERS (Grid) ---------------- */}
      <div className="bg-gray-50">
        <ProductGrid
          title="Best Sellers"
          subtitle="Most loved by our customers"
          layout="grid"
          columns={5}
          limit={8}
        />
      </div>

      {/* ---------------- 8. SHOP BY BRANDS (Carousel) ---------------- */}
      <div className="bg-white">
        <ProductGrid
          title="Shop By Brands"
          subtitle="Top picks from premium brands"
          layout="grid"
          columns={5}
          limit={8}
          showBrand={true}
        />
      </div>

      {/* ---------------- 9. CLEARANCE SALE (Grid) ---------------- */}
      <div className="bg-gray-50">
        <ProductGrid
          title="Clearance Sale"
          subtitle="Grab them before they are gone"
          layout="grid"
          limit={5}
          columns={5}
          tagSlug="natural"
        />
      </div>

      {/* ---------------- 10. SELLER BANNER — DARK ---------------- */}
      <div className="">
        <SellerBannerStrip />
      </div>

      {/* ---------------- 11. FAQ SECTION — WHITE ---------------- */}
      <div className="bg-white py-16">
        <FAQSection />
      </div>

      {/* ---------------- 12. BLOG LIST — LIGHT GRAY ---------------- */}
      <div className="bg-gray-50 py-16">
        <BlogList
          categories={['ayurveda', 'wellness']}
          limit={3}
          grid={3}
        />
      </div>

    </div>
  );
}
