import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import LoadingSpinner from './LoadingSpinner';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

const UserProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfileData>>({});

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      return response.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfileData>) => 
      apiRequest('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: 'প্রোফাইল আপডেট সফল',
        description: 'আপনার প্রোফাইল সফলভাবে আপডেট হয়েছে।',
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: 'ত্রুটি',
        description: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
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
            প্রোফাইল লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          ব্যক্তিগত তথ্য
          {!isEditing && (
            <Button 
              onClick={handleEdit}
              variant="outline"
              size="sm"
              data-testid="button-edit-profile"
            >
              সম্পাদনা করুন
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">নাম</Label>
              <Input
                id="name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="input-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">ফোন নম্বর</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                data-testid="input-phone"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">ঠিকানা</Label>
              <Input
                id="address"
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                data-testid="input-address"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={handleCancel}
                data-testid="button-cancel-edit"
              >
                বাতিল
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">নাম</Label>
                <p className="text-lg font-medium" data-testid="text-name">
                  {profile?.name || 'নাম দেওয়া হয়নি'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">ইমেইল</Label>
                <p className="text-lg" data-testid="text-email">
                  {profile?.email || 'ইমেইল দেওয়া হয়নি'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">ফোন নম্বর</Label>
                <p className="text-lg" data-testid="text-phone">
                  {profile?.phone || 'ফোন নম্বর দেওয়া হয়নি'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">ঠিকানা</Label>
                <p className="text-lg" data-testid="text-address">
                  {profile?.address || 'ঠিকানা দেওয়া হয়নি'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;