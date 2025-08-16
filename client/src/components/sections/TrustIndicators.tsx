import { motion } from "framer-motion";
import { Truck, Shield, Clock, CreditCard, Users, Star } from "lucide-react";

const TrustIndicators = () => {
  const indicators = [
    {
      icon: Truck,
      title: "ফ্রি ডেলিভারি",
      description: "৫০০ টাকার উপরে অর্ডারে",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      icon: Shield,
      title: "নিরাপদ পেমেন্ট",
      description: "১০০% সিকিউর লেনদেন",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      icon: Clock,
      title: "দ্রুত ডেলিভারি",
      description: "১-৩ দিনের মধ্যে",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
      icon: CreditCard,
      title: "ক্যাশ অন ডেলিভারি",
      description: "বাসায় বসে পেমেন্ট",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20"
    },
    {
      icon: Users,
      title: "১০,০০০+ গ্রাহক",
      description: "সন্তুষ্ট কাস্টমার",
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20"
    },
    {
      icon: Star,
      title: "৪.৮ রেটিং",
      description: "গ্রাহক সন্তুষ্টি",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            কেন আমাদের বেছে নিবেন?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            আমরা আমাদের গ্রাহকদের সর্বোচ্চ মানের সেবা এবং পণ্য প্রদান করতে প্রতিশ্রুতিবদ্ধ
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {indicators.map((indicator, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="text-center group"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${indicator.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <indicator.icon className={`w-8 h-8 ${indicator.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {indicator.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {indicator.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;