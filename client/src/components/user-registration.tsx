import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, User, Phone, Lock, UserPlus } from 'lucide-react';

interface UserRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function UserRegistration({ isOpen, onClose, onLoginClick }: UserRegistrationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<RegistrationData>>({});

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await apiRequest('POST', '/api/auth/register', {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        password: data.password
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "রেজিস্ট্রেশন সফল!",
        description: "আপনার অ্যাকাউন্ট তৈরি হয়েছে। এখন লগইন করুন।",
      });
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
      
      // Close registration and open login
      onClose();
      onLoginClick();
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "রেজিস্ট্রেশন ব্যর্থ",
        description: error.message || "অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'নাম প্রয়োজন';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'মোবাইল নম্বর প্রয়োজন';
    } else if (!/^01[3-9]\d{8}$/.test(formData.phone.trim())) {
      newErrors.phone = 'সঠিক মোবাইল নম্বর দিন (01xxxxxxxxx)';
    }

    if (!formData.password) {
      newErrors.password = 'পাসওয়ার্ড প্রয়োজন';
    } else if (formData.password.length < 6) {
      newErrors.password = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'পাসওয়ার্ড মিলছে না';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    registrationMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
            <UserPlus className="w-6 h-6 text-primary" />
            নতুন অ্যাকাউন্ট তৈরি করুন
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium">
                নাম *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="নাম"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName" className="text-sm font-medium">
                পদবী
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="পদবী"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              মোবাইল নম্বর *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="01xxxxxxxxx"
                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                maxLength={11}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium">
              পাসওয়ার্ড *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="পাসওয়ার্ড"
                className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              পাসওয়ার্ড নিশ্চিত করুন *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="পাসওয়ার্ড আবার লিখুন"
                className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={registrationMutation.isPending}
            >
              {registrationMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  অ্যাকাউন্ট তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  অ্যাকাউন্ট তৈরি করুন
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLoginClick();
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  লগইন করুন
                </button>
              </p>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}