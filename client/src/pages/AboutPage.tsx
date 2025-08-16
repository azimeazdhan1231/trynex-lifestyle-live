import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const AboutPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 text-center">আমাদের সম্পর্কে</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8 text-center">
              TryneX Lifestyle - বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গিফট এবং লাইফস্টাইল শপ
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <h2 className="text-2xl font-semibold mb-4">আমাদের লক্ষ্য</h2>
                <p className="text-gray-600">
                  আমরা বাংলাদেশের মানুষদের জন্য সেরা মানের পণ্য এবং অসাধারণ সেবা প্রদান করতে প্রতিশ্রুতিবদ্ধ।
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">আমাদের দৃষ্টিভঙ্গি</h2>
                <p className="text-gray-600">
                  প্রতিটি গ্রাহকের সন্তুষ্টি এবং বিশ্বাস অর্জনের মাধ্যমে বাংলাদেশের শীর্ষ ই-কমার্স প্ল্যাটফর্ম হয়ে ওঠা।
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <Link href="/contact">
                <Button size="lg">যোগাযোগ করুন</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AboutPage;