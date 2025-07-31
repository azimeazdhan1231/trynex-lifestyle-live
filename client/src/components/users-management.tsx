import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Search, Mail, Calendar, User } from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading, error } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    retry: 2,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const filteredUsers = users?.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ব্যবহারকারী ব্যবস্থাপনা</h2>
          <p className="text-gray-600 mt-1">
            রেজিস্টার্ড ব্যবহারকারীদের তালিকা এবং তথ্য
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            মোট ব্যবহারকারী: {users?.length || 0}
          </Badge>
          <Badge variant="outline" className="text-sm">
            অনলাইন: {users?.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 24*60*60*1000)).length || 0}
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ইমেইল বা নাম দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : !users || users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো ব্যবহারকারী নেই</h3>
            <p className="text-gray-600">
              এখনো কোনো ব্যবহারকারী রেজিস্টার করেননি।
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profileImageUrl || ''} alt={user.firstName || 'User'} />
                    <AvatarFallback>
                      {user.firstName?.[0] || user.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.email}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.createdAt && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        যোগদান: {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge variant="secondary">সক্রিয়</Badge>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    বিস্তারিত
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredUsers.length === 0 && users && users.length > 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো ফলাফল নেই</h3>
            <p className="text-gray-600">
              "{searchTerm}" এর জন্য কোনো ব্যবহারকারী পাওয়া যায়নি।
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}