import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface TrackingInfo {
  order_id: string;
  order_number: string;
  status: string;
  tracking_number?: string;
  estimated_delivery?: string;
  current_location?: string;
  tracking_history: TrackingEvent[];
  customer_info: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  total_amount: number;
}

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location?: string;
  timestamp: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

const OrderTracking = () => {
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);

  const { data: trackingInfo, isLoading, error } = useQuery({
    queryKey: ['/api/orders/track', orderNumber, phone],
    queryFn: async () => {
      const response = await fetch(`/api/orders/track?order_number=${orderNumber}&phone=${phone}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      return response.json();
    },
    enabled: searchClicked && orderNumber.trim() !== '' && phone.trim() !== '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      toast({
        title: 'তথ্য অসম্পূর্ণ',
        description: 'দয়া করে অর্ডার নম্বর এবং ফোন নম্বর দিন।',
        variant: 'destructive',
      });
      return;
    }
    setSearchClicked(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'অপেক্ষমান',
      confirmed: 'নিশ্চিত',
      processing: 'প্রস্তুত হচ্ছে',
      shipped: 'পাঠানো হয়েছে',
      delivered: 'পৌঁছেছে',
      cancelled: 'বাতিল',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString('bn-BD')}`;
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            অর্ডার খোঁজ করুন
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order-number">অর্ডার নম্বর</Label>
                <Input
                  id="order-number"
                  type="text"
                  placeholder="উদাহরণ: TRX-12345"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  data-testid="input-order-number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">ফোন নম্বর</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="০১৭১২৩৪৫৬৭ৈ"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  data-testid="input-phone"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              data-testid="button-search-order"
            >
              অর্ডার খোঁজ করুন
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tracking Results */}
      {searchClicked && (
        <>
          {isLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-red-500 mb-2">অর্ডার পাওয়া যায়নি</p>
                  <p className="text-sm text-gray-500">
                    অর্ডার নম্বর এবং ফোন নম্বর সঠিক কিনা চেক করুন।
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {trackingInfo && (
            <div className="space-y-6">
              {/* Order Status Card */}
              <Card data-testid={`order-status-${trackingInfo.order_id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>অর্ডার #{trackingInfo.order_number}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        মোট: {formatPrice(trackingInfo.total_amount)}
                      </p>
                    </div>
                    <Badge variant="default" className="flex items-center gap-2">
                      {getStatusIcon(trackingInfo.status)}
                      {getStatusText(trackingInfo.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trackingInfo.tracking_number && (
                      <div>
                        <Label className="text-sm font-medium">ট্র্যাকিং নম্বর</Label>
                        <p className="text-lg font-mono">{trackingInfo.tracking_number}</p>
                      </div>
                    )}
                    
                    {trackingInfo.estimated_delivery && (
                      <div>
                        <Label className="text-sm font-medium">আনুমানিক ডেলিভারি</Label>
                        <p className="text-lg">
                          {new Date(trackingInfo.estimated_delivery).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {trackingInfo.current_location && (
                    <div className="mt-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        বর্তমান অবস্থান: {trackingInfo.current_location}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tracking History */}
              <Card>
                <CardHeader>
                  <CardTitle>ট্র্যাকিং ইতিহাস</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingInfo.tracking_history.map((event, index) => (
                      <div 
                        key={event.id} 
                        className="flex gap-4 pb-4 border-b last:border-b-0"
                        data-testid={`tracking-event-${event.id}`}
                      >
                        <div className="flex-shrink-0">
                          {getStatusIcon(event.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium">{getStatusText(event.status)}</h4>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(event.timestamp), { 
                                addSuffix: true, 
                                locale: bn 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          {event.location && (
                            <p className="text-xs text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Customer & Items Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>গ্রাহক তথ্য</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">নাম</Label>
                      <p data-testid="customer-name">{trackingInfo.customer_info.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">ফোন</Label>
                      <p data-testid="customer-phone">{trackingInfo.customer_info.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">ঠিকানা</Label>
                      <p className="text-sm" data-testid="customer-address">
                        {trackingInfo.customer_info.address}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>অর্ডার করা পণ্য</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {trackingInfo.items.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex justify-between text-sm"
                          data-testid={`order-item-${item.id}`}
                        >
                          <span>
                            {item.product_name} × {item.quantity}
                          </span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>মোট</span>
                          <span data-testid="order-total">
                            {formatPrice(trackingInfo.total_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderTracking;