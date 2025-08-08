import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, UserPlus, Edit, Trash2, Shield, Eye, Mail, Phone } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin" | "moderator";
  status: "active" | "inactive" | "banned";
  created_at: string;
  last_login: string;
  total_orders: number;
  total_spent: number;
}

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Real API query for users data
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await apiRequest("PATCH", `/api/users/${selectedUser?.id}`, userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "ব্যবহারকারী আপডেট হয়েছে",
        description: "ব্যবহারকারীর তথ্য সফলভাবে আপডেট করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ব্যবহারকারী আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  // Filter users with null checks
  const filteredUsers = users.filter((user: User) => {
    if (!user) return false;
    
    const name = user.name || '';
    const email = user.email || '';
    const phone = user.phone || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phone.includes(searchTerm);
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "moderator": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-yellow-100 text-yellow-800";
      case "banned": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              ব্যবহারকারী ব্যবস্থাপনা
            </div>
            <Badge variant="secondary">{(users as User[]).length} জন ব্যবহারকারী</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="ভূমিকা নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ভূমিকা</SelectItem>
                <SelectItem value="customer">গ্রাহক</SelectItem>
                <SelectItem value="moderator">মডারেটর</SelectItem>
                <SelectItem value="admin">অ্যাডমিন</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                <SelectItem value="active">সক্রিয়</SelectItem>
                <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
                <SelectItem value="banned">ব্যান</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              নতুন ব্যবহারকারী
            </Button>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead>যোগাযোগ</TableHead>
                  <TableHead>ভূমিকা</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>অর্ডার</TableHead>
                  <TableHead>মোট খরচ</TableHead>
                  <TableHead>সর্বশেষ লগইন</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role === "customer" ? "গ্রাহক" : 
                         user.role === "moderator" ? "মডারেটর" : "অ্যাডমিন"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(user.status)}>
                        {user.status === "active" ? "সক্রিয়" :
                         user.status === "inactive" ? "নিষ্ক্রিয়" : "ব্যান"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.total_orders}</TableCell>
                    <TableCell>৳{user.total_spent.toLocaleString()}</TableCell>
                    <TableCell>{new Date(user.last_login).toLocaleDateString('bn-BD')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              কোনো ব্যবহারকারী পাওয়া যায়নি
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "ব্যবহারকারী সম্পাদনা" : "ব্যবহারকারীর বিস্তারিত"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>নাম</Label>
                  <Input value={selectedUser.name} readOnly={!isEditing} />
                </div>
                <div>
                  <Label>ইমেইল</Label>
                  <Input value={selectedUser.email} readOnly={!isEditing} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ফোন</Label>
                  <Input value={selectedUser.phone} readOnly={!isEditing} />
                </div>
                <div>
                  <Label>ভূমিকা</Label>
                  {isEditing ? (
                    <Select defaultValue={selectedUser.role}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">গ্রাহক</SelectItem>
                        <SelectItem value="moderator">মডারেটর</SelectItem>
                        <SelectItem value="admin">অ্যাডমিন</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={selectedUser.role} readOnly />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>স্ট্যাটাস</Label>
                  {isEditing ? (
                    <Select defaultValue={selectedUser.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">সক্রিয়</SelectItem>
                        <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
                        <SelectItem value="banned">ব্যান</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={selectedUser.status} readOnly />
                  )}
                </div>
                <div>
                  <Label>যোগদানের তারিখ</Label>
                  <Input value={new Date(selectedUser.created_at).toLocaleDateString('bn-BD')} readOnly />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>মোট অর্ডার</Label>
                  <Input value={selectedUser.total_orders} readOnly />
                </div>
                <div>
                  <Label>মোট খরচ</Label>
                  <Input value={`৳${selectedUser.total_spent.toLocaleString()}`} readOnly />
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    বাতিল
                  </Button>
                  <Button 
                    onClick={() => updateUserMutation.mutate(selectedUser)}
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending ? "সেভ করা হচ্ছে..." : "সেভ করুন"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}