import Layout from "@/components/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
          <h1 className="text-3xl font-bold mb-4">পেজ পাওয়া যায়নি</h1>
          <p className="text-gray-600 mb-8">
            দুঃখিত, আপনি যে পেজটি খুঁজছেন সেটি পাওয়া যায়নি।
          </p>
          <div className="space-y-4">
            <Link href="/">
              <Button size="lg" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                হোম পেজে ফিরে যান
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="lg" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                অনুসন্ধান করুন
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;