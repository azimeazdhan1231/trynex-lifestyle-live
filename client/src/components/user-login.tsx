import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Phone, Lock, LogIn } from 'lucide-react';

interface UserLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
  onLoginSuccess: (userData: any) => void;
}

interface LoginData {
  phone: string;
  password: string;
}

export default function UserLogin({ isOpen, onClose, onRegisterClick, onLoginSuccess }: UserLoginProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<LoginData>({
    phone: '',
    password: ''
  });

  const [errors, setErrors] = useState<Partial<LoginData>>({});

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest('/api/auth/login', 'POST', {
        phone: data.phone.trim(),
        password: data.password
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'লগইন ব্যর্থ হয়েছে');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "লগইন সফল!",
        description: "স্বাগতম! আপনি সফলভাবে লগইন করেছেন।",
      });
      
      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
      }
      
      // Clear form
      setFormData({ phone: '', password: '' });
      setErrors({});
      
      // Close modal and notify parent
      onClose();
      onLoginSuccess(data.user);
    },
    onError: (error: any) => {
      toast({
        title: "লগইন ব্যর্থ",
        description: error.message || "ফোন নম্বর বা পাসওয়ার্ড ভুল। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'মোবাইল নম্বর প্রয়োজন';
    } else if (!/^01[3-9]\d{8}$/.test(formData.phone.trim())) {
      newErrors.phone = 'সঠিক মোবাইল নম্বর দিন';
    }

    if (!formData.password) {
      newErrors.password = 'পাসওয়ার্ড প্রয়োজন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    loginMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof LoginData, value: string) => {
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
            <LogIn className="w-6 h-6 text-primary" />
            লগইন করুন
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="loginPhone" className="text-sm font-medium">
              মোবাইল নম্বর
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="loginPhone"
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
            <Label htmlFor="loginPassword" className="text-sm font-medium">
              পাসওয়ার্ড
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="loginPassword"
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

          <div className="space-y-3 pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  লগইন হচ্ছে...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  লগইন করুন
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                নতুন ব্যবহারকারী?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRegisterClick();
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  অ্যাকাউন্ট তৈরি করুন
                </button>
              </p>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}