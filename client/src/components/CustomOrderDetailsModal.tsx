import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/constants";
import { Calendar, Phone, MapPin, Package, Palette, Ruler, Image as ImageIcon, X } from "lucide-react";

interface CustomOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function CustomOrderDetailsModal({ 
  isOpen, 
  onClose, 
  order 
}: CustomOrderDetailsModalProps) {
  if (!order) return null;

  // Parse custom images if they exist
  const customImages = order.customImageData ? JSON.parse(order.customImageData) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "অপেক্ষমান",
      processing: "প্রক্রিয়াধীন", 
      shipped: "পাঠানো হয়েছে",
      delivered: "ডেলিভার হয়েছে",
      cancelled: "বাতিল"
    };
    return statusMap[status] || status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              কাস্টম অর্ডার বিবরণী #{order.id}
            </DialogTitle>
            <Badge className={`px-3 py-1 ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              গ্রাহকের তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">নাম</p>
                <p className="font-semibold">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">ফোন নম্বর</p>
                <p className="font-semibold">{order.phone}</p>
              </div>
              {order.email && (
                <div>
                  <p className="text-sm font-medium text-gray-600">ইমেইল</p>
                  <p className="font-semibold">{order.email}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  ঠিকানা
                </p>
                <p className="font-semibold">{order.address}</p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              পণ্যের তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">পণ্যের নাম</p>
                <p className="font-semibold">{order.productName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">পরিমাণ</p>
                <p className="font-semibold">{order.quantity} টি</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">দাম</p>
                <p className="font-semibold">{formatPrice(Number(order.productPrice))}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">মোট দাম</p>
                <p className="font-semibold text-lg text-green-600">{formatPrice(Number(order.totalPrice))}</p>
              </div>
            </div>
          </div>

          {/* Customization Details */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">কাস্টমাইজেশন বিবরণী</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.selectedSize && (
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">নির্বাচিত সাইজ</p>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {order.selectedSize}
                    </Badge>
                  </div>
                </div>
              )}
              {order.selectedColor && (
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">নির্বাচিত রঙ</p>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {order.selectedColor}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            
            {order.instructions && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">বিশেষ নির্দেশনা</p>
                <p className="bg-white p-3 rounded border text-sm">{order.instructions}</p>
              </div>
            )}
          </div>

          {/* Custom Images */}
          {customImages.length > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                কাস্টম ছবি ({customImages.length} টি)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {customImages.map((image: any, index: number) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                      <img
                        src={image.dataUrl || image.url}
                        alt={`Custom image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          // Open image in new tab for full view
                          const newWindow = window.open();
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head><title>Custom Image ${index + 1}</title></head>
                                <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#000;">
                                  <img src="${image.dataUrl || image.url}" style="max-width:100%; max-height:100%; object-fit:contain;" />
                                </body>
                              </html>
                            `);
                          }
                        }}
                        className="text-white bg-black bg-opacity-70 hover:bg-opacity-90"
                      >
                        বড় করে দেখুন
                      </Button>
                    </div>
                    {image.name && (
                      <p className="text-xs text-gray-600 mt-1 text-center truncate">
                        {image.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              অর্ডার সময়সূচী
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">অর্ডার তৈরি</p>
                  <p className="text-xs text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString('bn-BD') : 'তারিখ অনুপলব্ধ'}
                  </p>
                </div>
              </div>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">সর্বশেষ আপডেট</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.updatedAt).toLocaleString('bn-BD')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            বন্ধ করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}