import { Card, CardContent } from '@/components/ui/card';
import { Shield, FileText, Clock, CheckCircle } from 'lucide-react';

interface PolicyContentProps {
  type: 'privacy' | 'terms' | 'return' | 'refund';
}

const PolicyContent = ({ type }: PolicyContentProps) => {
  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'গোপনীয়তা নীতি',
          icon: <Shield className="h-8 w-8 text-primary" />,
          sections: [
            {
              title: 'তথ্য সংগ্রহ',
              content: 'আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ। আমরা শুধুমাত্র প্রয়োজনীয় তথ্য সংগ্রহ করি।'
            },
            {
              title: 'তথ্যের ব্যবহার',
              content: 'আপনার তথ্য শুধুমাত্র অর্ডার প্রক্রিয়াকরণ এবং সেবা উন্নতির জন্য ব্যবহৃত হয়।'
            },
            {
              title: 'তথ্য সুরক্ষা',
              content: 'আমরা উন্নত নিরাপত্তা ব্যবস্থা ব্যবহার করে আপনার তথ্য সুরক্ষিত রাখি।'
            },
          ]
        };
        
      case 'terms':
        return {
          title: 'ব্যবহারের শর্তাবলী',
          icon: <FileText className="h-8 w-8 text-primary" />,
          sections: [
            {
              title: 'সেবা ব্যবহার',
              content: 'এই ওয়েবসাইট ব্যবহার করে আপনি আমাদের শর্তাবলী মেনে নিতে সম্মত হন।'
            },
            {
              title: 'অর্ডার প্রক্রিয়া',
              content: 'সকল অর্ডার আমাদের নিশ্চিতকরণের পর চূড়ান্ত হবে।'
            },
            {
              title: 'দায়বদ্ধতা',
              content: 'প্রোডাক্টের গুণগত মান নিশ্চিত করতে আমরা প্রতিশ্রুতিবদ্ধ।'
            },
          ]
        };
        
      case 'return':
        return {
          title: 'পণ্য ফেরত নীতি',
          icon: <Clock className="h-8 w-8 text-primary" />,
          sections: [
            {
              title: 'ফেরত শর্ত',
              content: 'পণ্য পাওয়ার ৭ দিনের মধ্যে ফেরত দেওয়া যাবে।'
            },
            {
              title: 'ফেরতযোগ্য পণ্য',
              content: 'অব্যবহৃত এবং ক্ষতিহীন পণ্য ফেরত নেওয়া হয়।'
            },
            {
              title: 'প্রক্রিয়া',
              content: 'ফেরত দিতে চাইলে আমাদের সাথে যোগাযোগ করুন।'
            },
          ]
        };
        
      case 'refund':
        return {
          title: 'টাকা ফেরত নীতি',
          icon: <CheckCircle className="h-8 w-8 text-primary" />,
          sections: [
            {
              title: 'রিফান্ড শর্ত',
              content: 'পণ্য ফেরতের পর ১০-১৫ কার্যদিবসে টাকা ফেরত দেওয়া হবে।'
            },
            {
              title: 'রিফান্ড পদ্ধতি',
              content: 'মূল পেমেন্ট পদ্ধতিতেই রিফান্ড করা হয়।'
            },
            {
              title: 'বিশেষ ক্ষেত্র',
              content: 'কাস্টমাইজড পণ্য রিফান্ড করা হয় না।'
            },
          ]
        };
        
      default:
        return {
          title: 'নীতি',
          icon: <FileText className="h-8 w-8 text-primary" />,
          sections: []
        };
    }
  };

  const content = getContent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
        <div className="flex justify-center mb-4">
          {content.icon}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {content.title}
        </h1>
        <p className="text-gray-600">
          TryneX Lifestyle - আপনার বিশ্বস্ত অনলাইন শপিং পার্টনার
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {content.sections.map((section, index) => (
          <Card key={index} data-testid={`policy-section-${index}`}>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {section.title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {section.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Information */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            যোগাযোগ
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>কোন প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন:</p>
            <div className="space-y-1">
              <p><strong>ইমেইল:</strong> support@trynexlifestyle.com</p>
              <p><strong>ফোন:</strong> +৮৮০ ১৭১২ ৩৪৫৬৭৮</p>
              <p><strong>সময়:</strong> সকাল ৯টা - রাত ৯টা (রোজ)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 pt-4">
        <p>সর্বশেষ আপডেট: {new Date().toLocaleDateString('bn-BD')}</p>
      </div>
    </div>
  );
};

export default PolicyContent;