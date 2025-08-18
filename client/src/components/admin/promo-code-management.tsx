import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Tag, Copy, CheckCircle, XCircle, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  used_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export default function PromoCodeManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    {
      id: '1',
      code: 'WELCOME10',
      description: 'Welcome discount for new customers',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 500,
      max_discount_amount: 200,
      usage_limit: 100,
      used_count: 25,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      code: 'GIFT50',
      description: 'Fixed 50 taka discount',
      discount_type: 'fixed',
      discount_value: 50,
      min_order_amount: 300,
      max_discount_amount: 50,
      usage_limit: 500,
      used_count: 123,
      start_date: '2024-01-01',
      end_date: '2024-06-30',
      is_active: true,
      created_at: '2024-01-15T00:00:00Z',
    }
  ]);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    usage_limit: 0,
    start_date: '',
    end_date: '',
    is_active: true,
  });
  
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_amount: 0,
      max_discount_amount: 0,
      usage_limit: 0,
      start_date: '',
      end_date: '',
      is_active: true,
    });
  };

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ 
        title: 'কপি হয়েছে!', 
        description: 'প্রোমো কোড ক্লিপবোর্ডে কপি করা হয়েছে' 
      });
    });
  };

  const openDialog = (promo?: PromoCode) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        min_order_amount: promo.min_order_amount,
        max_discount_amount: promo.max_discount_amount,
        usage_limit: promo.usage_limit,
        start_date: promo.start_date,
        end_date: promo.end_date,
        is_active: promo.is_active,
      });
    } else {
      setEditingPromo(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.description) {
      toast({
        title: 'ত্রুটি!',
        description: 'প্রোমো কোড এবং বর্ণনা আবশ্যক',
        variant: 'destructive'
      });
      return;
    }

    if (formData.discount_value <= 0) {
      toast({
        title: 'ত্রুটি!',
        description: 'ছাড়ের পরিমাণ শূন্যের চেয়ে বেশি হতে হবে',
        variant: 'destructive'
      });
      return;
    }

    const existingCode = promoCodes.find(p => 
      p.code === formData.code && (!editingPromo || p.id !== editingPromo.id)
    );
    
    if (existingCode) {
      toast({
        title: 'ত্রুটি!',
        description: 'এই প্রোমো কোডটি ইতিমধ্যে বিদ্যমান',
        variant: 'destructive'
      });
      return;
    }

    const promoData = {
      ...formData,
      id: editingPromo ? editingPromo.id : Date.now().toString(),
      used_count: editingPromo ? editingPromo.used_count : 0,
      created_at: editingPromo ? editingPromo.created_at : new Date().toISOString(),
    };

    if (editingPromo) {
      setPromoCodes(prev => prev.map(promo => 
        promo.id === editingPromo.id ? promoData as PromoCode : promo
      ));
      toast({ title: 'সফল!', description: 'প্রোমো কোড সফলভাবে আপডেট হয়েছে' });
    } else {
      setPromoCodes(prev => [...prev, promoData as PromoCode]);
      toast({ title: 'সফল!', description: 'প্রোমো কোড সফলভাবে যোগ করা হয়েছে' });
    }

    setIsDialogOpen(false);
    resetForm();
    setEditingPromo(null);
  };

  const handleDelete = (id: string) => {
    setPromoCodes(prev => prev.filter(promo => promo.id !== id));
    toast({ title: 'সফল!', description: 'প্রোমো কোড সফলভাবে মুছে ফেলা হয়েছে' });
  };

  const formatPrice = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const isPromoActive = (promo: PromoCode) => {
    if (!promo.is_active) return false;
    if (promo.usage_limit > 0 && promo.used_count >= promo.usage_limit) return false;
    const now = new Date();
    const startDate = new Date(promo.start_date);
    const endDate = new Date(promo.end_date);
    return now >= startDate && now <= endDate;
  };

  const getPromoStatus = (promo: PromoCode) => {
    if (!promo.is_active) return { status: 'নিষ্ক্রিয়', color: 'bg-gray-100 text-gray-800 border-gray-300' };
    if (promo.usage_limit > 0 && promo.used_count >= promo.usage_limit) 
      return { status: 'সীমা শেষ', color: 'bg-red-100 text-red-800 border-red-300' };
    if (new Date(promo.end_date) < new Date()) 
      return { status: 'মেয়াদ শেষ', color: 'bg-red-100 text-red-800 border-red-300' };
    if (new Date(promo.start_date) > new Date()) 
      return { status: 'আসন্ন', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    return { status: 'সক্রিয়', color: 'bg-green-100 text-green-800 border-green-300' };
  };

  const activePromos = promoCodes.filter(p => isPromoActive(p));
  const totalUsage = promoCodes.reduce((sum, p) => sum + p.used_count, 0);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">প্রোমো কোড ব্যবস্থাপনা</h2>
          <p className="text-gray-600">কাস্টমারদের জন্য প্রোমো কোড তৈরি এবং ব্যবস্থাপনা করুন</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => openDialog()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              নতুন প্রোমো কোড
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPromo ? 'প্রোমো কোড সম্পাদনা' : 'নতুন প্রোমো কোড যোগ করুন'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">প্রোমো কোড *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      data-testid="input-promo-code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="PROMO2024"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generatePromoCode}
                      data-testid="button-generate-code"
                    >
                      জেনারেট
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="discount_type">ছাড়ের ধরন</Label>
                  <Select 
                    value={formData.discount_type} 
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setFormData(prev => ({ ...prev, discount_type: value }))
                    }
                  >
                    <SelectTrigger data-testid="select-discount-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">শতাংশ (%)</SelectItem>
                      <SelectItem value="fixed">নির্দিষ্ট পরিমাণ (৳)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">বর্ণনা *</Label>
                <Textarea
                  id="description"
                  data-testid="textarea-promo-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="প্রোমো কোডের বিস্তারিত বর্ণনা..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="discount_value">
                    ছাড়ের পরিমাণ {formData.discount_type === 'percentage' ? '(%)' : '(৳)'} *
                  </Label>
                  <Input
                    id="discount_value"
                    data-testid="input-discount-value"
                    type="number"
                    min="0"
                    max={formData.discount_type === 'percentage' ? "100" : undefined}
                    value={formData.discount_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="min_order_amount">মিনিমাম অর্ডার (৳)</Label>
                  <Input
                    id="min_order_amount"
                    data-testid="input-min-order-amount"
                    type="number"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_discount_amount">সর্বোচ্চ ছাড় (৳)</Label>
                  <Input
                    id="max_discount_amount"
                    data-testid="input-max-discount-amount"
                    type="number"
                    min="0"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_discount_amount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="usage_limit">ব্যবহারের সীমা</Label>
                  <Input
                    id="usage_limit"
                    data-testid="input-usage-limit"
                    type="number"
                    min="0"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: parseInt(e.target.value) || 0 }))}
                    placeholder="০ = সীমাহীন"
                  />
                </div>
                
                <div>
                  <Label htmlFor="start_date">শুরুর তারিখ</Label>
                  <Input
                    id="start_date"
                    data-testid="input-start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_date">শেষের তারিখ</Label>
                  <Input
                    id="end_date"
                    data-testid="input-end-date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  data-testid="switch-promo-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">সক্রিয়</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {editingPromo ? 'আপডেট করুন' : 'যোগ করুন'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promo Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">মোট প্রোমো কোড</p>
                <p className="text-3xl font-bold text-gray-900">{promoCodes.length}</p>
              </div>
              <Tag className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">সক্রিয় প্রোমো</p>
                <p className="text-3xl font-bold text-green-600">{activePromos.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">মোট ব্যবহার</p>
                <p className="text-3xl font-bold text-purple-600">{totalUsage}</p>
              </div>
              <Gift className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">মেয়াদ শেষ</p>
                <p className="text-3xl font-bold text-red-600">
                  {promoCodes.filter(p => new Date(p.end_date) < new Date()).length}
                </p>
              </div>
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promo Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>প্রোমো কোড তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          {promoCodes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>কোড</TableHead>
                  <TableHead>ছাড়</TableHead>
                  <TableHead>শর্তাবলী</TableHead>
                  <TableHead>ব্যবহার</TableHead>
                  <TableHead>সময়সীমা</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promo) => {
                  const statusInfo = getPromoStatus(promo);
                  return (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-indigo-600">{promo.code}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(promo.code)}
                            className="h-6 w-6 p-0"
                            data-testid={`button-copy-${promo.id}`}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {promo.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          {promo.discount_type === 'percentage' 
                            ? `${promo.discount_value}% ছাড়`
                            : `${formatPrice(promo.discount_value)} ছাড়`
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {promo.min_order_amount > 0 && (
                            <p>মিনিমাম: {formatPrice(promo.min_order_amount)}</p>
                          )}
                          {promo.max_discount_amount > 0 && promo.discount_type === 'percentage' && (
                            <p>সর্বোচ্চ: {formatPrice(promo.max_discount_amount)}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-semibold">{promo.used_count}</p>
                          {promo.usage_limit > 0 ? (
                            <>
                              <p className="text-gray-500">/ {promo.usage_limit}</p>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full" 
                                  style={{ 
                                    width: `${Math.min((promo.used_count / promo.usage_limit) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </>
                          ) : (
                            <p className="text-gray-500">/ সীমাহীন</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(promo.start_date).toLocaleDateString('bn-BD')}</p>
                          <p className="text-gray-500">থেকে</p>
                          <p>{new Date(promo.end_date).toLocaleDateString('bn-BD')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={statusInfo.color}
                        >
                          {statusInfo.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(promo)}
                            data-testid={`button-edit-promo-${promo.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(promo.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-delete-promo-${promo.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">কোন প্রোমো কোড পাওয়া যায়নি</p>
              <p className="text-gray-400 text-sm mb-4">
                কাস্টমারদের আকর্ষণ করার জন্য প্রোমো কোড তৈরি করুন
              </p>
              <Button 
                onClick={() => openDialog()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                প্রথম প্রোমো কোড তৈরি করুন
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}