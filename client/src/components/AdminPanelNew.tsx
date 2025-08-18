import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Users,
  BarChart3,
  Gift,
  Tag,
  LogOut,
  Bell,
  Menu,
  X,
  Home
} from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import OrderManagement from "@/components/admin/OrderManagement";
import ProductManagement from "@/components/admin/ProductManagement";
import SiteSettings from "@/components/admin/SiteSettings";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanelNew({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get real-time data for badges
  const { data: orders } = useQuery({
    queryKey: ['/api/admin/orders'],
    refetchInterval: 10000,
  });

  const { data: products } = useQuery({
    queryKey: ['/api/admin/products'],
    refetchInterval: 30000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000,
  });

  const pendingOrders = orders?.filter((order: any) => order.status === 'pending')?.length || 0;
  const lowStockProducts = products?.filter((product: any) => product.stock < 5)?.length || 0;

  const menuItems = [
    {
      id: "dashboard",
      label: "ড্যাশবোর্ড",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "orders",
      label: "অর্ডার",
      icon: ShoppingCart,
      badge: pendingOrders > 0 ? pendingOrders : null,
    },
    {
      id: "products",
      label: "পণ্য",
      icon: Package,
      badge: lowStockProducts > 0 ? lowStockProducts : null,
    },
    {
      id: "settings",
      label: "সেটিংস",
      icon: Settings,
      badge: null,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "orders":
        return <OrderManagement />;
      case "products":
        return <ProductManagement />;
      case "settings":
        return <SiteSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? 'fixed inset-0 z-50 bg-black/50' : 'relative'}`}>
      <div className={`
        ${mobile ? 'fixed left-0 top-0 h-full w-80' : 'h-full w-64'}
        bg-white border-r border-gray-200 flex flex-col
      `}>
        {mobile && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {!mobile && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Admin</h2>
                <p className="text-sm text-gray-600">Trynex Lifestyle</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (mobile) setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200
                  ${isActive
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <Badge 
                    variant={isActive ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link href="/" className="block">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <Home className="w-4 h-4 mr-2" />
              ফ্রন্ট সাইট দেখুন
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            লগআউট
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden">
            <Sidebar mobile />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {(pendingOrders > 0 || lowStockProducts > 0) && (
                <div className="relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {menuItems.find(item => item.id === activeTab)?.label}
                </h1>
                <p className="text-gray-600">
                  {activeTab === "dashboard" && "ব্যবসার সম্পূর্ণ তথ্য এক নজরে দেখুন"}
                  {activeTab === "orders" && "সকল অর্ডার পরিচালনা করুন"}
                  {activeTab === "products" && "পণ্য যোগ, সম্পাদনা ও পরিচালনা করুন"}
                  {activeTab === "settings" && "ওয়েবসাইটের সকল সেটিংস নিয়ন্ত্রণ করুন"}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                {(pendingOrders > 0 || lowStockProducts > 0) && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 text-orange-800">
                        <Bell className="w-4 h-4" />
                        <div className="text-sm">
                          {pendingOrders > 0 && (
                            <p>{pendingOrders} টি নতুন অর্ডার</p>
                          )}
                          {lowStockProducts > 0 && (
                            <p>{lowStockProducts} টি পণ্যের স্টক কম</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Link href="/">
                  <Button variant="outline">
                    <Home className="w-4 h-4 mr-2" />
                    ফ্রন্ট সাইট
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}