import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Calendar,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Edit,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import { useLocation } from "wouter";

interface UserData {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  email?: string;
  profileImageUrl?: string;
  createdAt: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization?: any;
}

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  district: string;
  thana: string;
  address: string;
  phone: string;
  status: string;
  items: OrderItem[];
  total: string;
  created_at: string;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Get user data from localStorage
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const user = localStorage.getItem("user_data");
    
    if (!token || !user) {
      navigate("/auth");
      return;
    }
    
    try {
      setUserData(JSON.parse(user));
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/auth");
    }
  }, [navigate]);

  // Fetch user's orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/user"],
    enabled: !!userData,
    retry: 1,
  });

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    toast({
      title: "লগআউট সম্পন্ন",
      description: "আপনি সফলভাবে লগআউট হয়েছেন",
    });
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'অপেক্ষমান';
      case 'confirmed':
        return 'নিশ্চিত';
      case 'shipped':
        return 'পাঠানো হয়েছে';
      case 'delivered':
        return 'ডেলিভার';
      case 'cancelled':
        return 'বাতিল';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <Package className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={0} onCartOpen={() => {}} />
      
      <div className="container mx-auto px-4 py-8" style={{ marginTop: "72px" }}>
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 border-4 border-white/20">
                      <AvatarImage src={userData.profileImageUrl} />
                      <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                        {userData.firstName.charAt(0)}{userData.lastName?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-2xl font-bold">
                        স্বাগতম, {userData.firstName} {userData.lastName}
                      </h1>
                      <p className="text-white/80 flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-2" />
                        {userData.phone}
                      </p>
                      <p className="text-white/80 flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        {userData.address}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      প্রোফাইল এডিট
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      লগআউট
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Content */}
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders" className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4" />
                <span>আমার অর্ডার</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>প্রোফাইল</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>পরিসংখ্যান</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span>আমার অর্ডার সমূহ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-24 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">কোনো অর্ডার নেই</h3>
                      <p className="text-gray-500 mb-4">আপনি এখনো কোনো অর্ডার করেননি</p>
                      <Button onClick={() => navigate("/products")}>
                        পণ্য দেখুন
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-semibold">অর্ডার #{order.tracking_id}</h3>
                                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1">{getStatusText(order.status)}</span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(order.created_at).toLocaleDateString('bn-BD')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  ৳{formatPrice(Number(order.total))}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {order.items.length} টি পণ্য
                                </p>
                              </div>
                            </div>
                            
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-2">অর্ডার বিস্তারিত:</h4>
                              <div className="space-y-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center text-sm">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span className="font-medium">৳{formatPrice(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="border-t pt-4 mt-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{order.district}, {order.thana}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>প্রোফাইল তথ্য</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">নাম</label>
                      <p className="text-lg">{userData.firstName} {userData.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">ফোন নম্বর</label>
                      <p className="text-lg">{userData.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">ঠিকানা</label>
                      <p className="text-lg">{userData.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">যোগদানের তারিখ</label>
                      <p className="text-lg">{new Date(userData.createdAt).toLocaleDateString('bn-BD')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <ShoppingBag className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">{orders.length}</h3>
                    <p className="text-gray-600">মোট অর্ডার</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Package className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">
                      {orders.filter(o => o.status === 'delivered').length}
                    </h3>
                    <p className="text-gray-600">ডেলিভার সম্পন্ন</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">
                      ৳{formatPrice(orders.reduce((total, order) => total + Number(order.total), 0))}
                    </h3>
                    <p className="text-gray-600">মোট খরচ</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}