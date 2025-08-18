import Layout from "@/components/Layout";
import PremiumHeroSection from "@/components/PremiumHeroSection";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import CategoryShowcase from "@/components/sections/CategoryShowcase";
import TrustIndicators from "@/components/sections/TrustIndicators";
import NewsletterSection from "@/components/sections/NewsletterSection";

const HomePage = () => {
  return (
    <Layout>
      <PremiumHeroSection />
      <TrustIndicators />
      <CategoryShowcase />
      <FeaturedProducts />
      <NewsletterSection />
    </Layout>
  );
};

export default HomePage;