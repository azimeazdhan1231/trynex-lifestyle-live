import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';
import LoadingSpinner from './LoadingSpinner';
import { Package, Eye } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  customization?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  shipping_address?: string;
  phone?: string;
}

const OrderHistory = () => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['/api/user/orders'],
    queryFn: async () => {
      const response = await fetch('/api/user/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'অপেক্ষমান', variant: 'secondary' as const },
      confirmed: { label: 'নিশ্চিত', variant: 'default' as const },
      processing: { label: 'প্রস্তুত হচ্ছে', variant: 'default' as const },
      shipped: { label: 'পাঠানো হয়েছে', variant: 'default' as const },
      delivered: { label: 'পৌঁছেছে', variant: 'default' as const },
      cancelled: { label: 'বাতিল', variant: 'destructive' as const },
    };

    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString('bn-BD')}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-500">
            অর্ডার ইতিহাস লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2">কোনো অর্ডার পাওয়া যায়নি</p>
            <p className="text-sm text-gray-400">আপনি এখনো কোনো অর্ডার করেননি।</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: Order) => {
        const statusInfo = getStatusBadge(order.status);
        
        return (
          <Card key={order.id} data-testid={`order-card-${order.id}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    অর্ডার #{order.order_number}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {formatDistanceToNow(new Date(order.created_at), { 
                      addSuffix: true, 
                      locale: bn 
                    })}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <Badge variant={statusInfo.variant}>
                    {statusInfo.label}
                  </Badge>
                  <p className="text-lg font-semibold" data-testid={`order-total-${order.id}`}>
                    {formatPrice(order.total_amount)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">অর্ডার করা পণ্য:</h4>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex justify-between text-sm"
                        data-testid={`order-item-${item.id}`}
                      >
                        <span>
                          {item.product_name} × {item.quantity}
                          {item.customization && (
                            <span className="text-gray-500 ml-1">
                              ({item.customization})
                            </span>
                          )}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Information */}
                {order.shipping_address && (
                  <div className="text-sm text-gray-600">
                    <strong>ডেলিভারি ঠিকানা:</strong> {order.shipping_address}
                  </div>
                )}

                {order.phone && (
                  <div className="text-sm text-gray-600">
                    <strong>ফোন:</strong> {order.phone}
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid={`button-view-order-${order.id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    বিস্তারিত দেখুন
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OrderHistory;