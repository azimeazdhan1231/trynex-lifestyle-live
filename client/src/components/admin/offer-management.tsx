import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Gift, Percent, Calendar, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Offer {
  id: string;
  title: string;
  title_bengali: string;
  description: string;
  discount_percentage: number;
  discount_amount: number;
  min_order_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export default function OfferManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: '1',
      title: 'New Year Special',
      title_bengali: 'নববর্ষ বিশেষ অফার',
      description: 'Get 20% discount on all gift items',
      discount_percentage: 20,
      discount_amount: 0,
      min_order_amount: 1000,
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Valentine Special',
      title_bengali: 'ভ্যালেন্টাইন বিশেষ',
      description: 'Buy 2 get 1 free on selected items',
      discount_percentage: 0,
      discount_amount: 500,
      min_order_amount: 2000,
      start_date: '2024-02-01',
      end_date: '2024-02-14',
      is_active: false,
      created_at: '2024-01-15T00:00:00Z',
    }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    title_bengali: '',
    description: '',
    discount_percentage: 0,
    discount_amount: 0,
    min_order_amount: 0,
    start_date: '',
    end_date: '',
    is_active: true,
  });
  
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      title: '',
      title_bengali: '',
      description: '',
      discount_percentage: 0,
      discount_amount: 0,
      min_order_amount: 0,
      start_date: '',
      end_date: '',
      is_active: true,
    });
  };

  const openDialog = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        title: offer.title,
        title_bengali: offer.title_bengali,
        description: offer.description,
        discount_percentage: offer.discount_percentage,
        discount_amount: offer.discount_amount,
        min_order_amount: offer.min_order_amount,
        start_date: offer.start_date,
        end_date: offer.end_date,
        is_active: offer.is_active,
      });
    } else {
      setEditingOffer(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.title_bengali) {
      toast({
        title: 'ত্রুটি!',
        description: 'অফারের শিরোনাম (ইংরেজি ও বাংলা) আবশ্যক',
        variant: 'destructive'
      });
      return;
    }

    if (formData.discount_percentage === 0 && formData.discount_amount === 0) {
      toast({
        title: 'ত্রুটি!',
        description: 'শতাংশ বা টাকার পরিমাণ - অন্তত একটি ছাড় দিন',
        variant: 'destructive'
      });
      return;
    }

    const offerData = {
      ...formData,
      id: editingOffer ? editingOffer.id : Date.now().toString(),
      created_at: editingOffer ? editingOffer.created_at : new Date().toISOString(),
    };

    if (editingOffer) {
      setOffers(prev => prev.map(offer => 
        offer.id === editingOffer.id ? offerData as Offer : offer
      ));
      toast({ title: 'সফল!', description: 'অফার সফলভাবে আপডেট হয়েছে' });
    } else {
      setOffers(prev => [...prev, offerData as Offer]);
      toast({ title: 'সফল!', description: 'অফার সফলভাবে যোগ করা হয়েছে' });
    }

    setIsDialogOpen(false);
    resetForm();
    setEditingOffer(null);
  };

  const handleDelete = (id: string) => {
    setOffers(prev => prev.filter(offer => offer.id !== id));
    toast({ title: 'সফল!', description: 'অফার সফলভাবে মুছে ফেলা হয়েছে' });
  };

  const formatPrice = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const isOfferActive = (offer: Offer) => {
    if (!offer.is_active) return false;
    const now = new Date();
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);
    return now >= startDate && now <= endDate;
  };

  const activeOffers = offers.filter(o => isOfferActive(o));
  const upcomingOffers = offers.filter(o => o.is_active && new Date(o.start_date) > new Date());
  const expiredOffers = offers.filter(o => new Date(o.end_date) < new Date());

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">অফার ব্যবস্থাপনা</h2>
          <p className="text-gray-600">বিশেষ অফার এবং ছাড় ব্যবস্থাপনা করুন</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => openDialog()}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              নতুন অফার
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? 'অফার সম্পাদনা' : 'নতুন অফার যোগ করুন'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">ইংরেজি শিরোনাম *</Label>
                  <Input
                    id="title"
                    data-testid="input-offer-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Offer Title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="title_bengali">বাংলা শিরোনাম *</Label>
                  <Input
                    id="title_bengali"
                    data-testid="input-offer-title-bengali"
                    value={formData.title_bengali}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_bengali: e.target.value }))}
                    placeholder="অফারের শিরোনাম"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">বর্ণনা</Label>
                <Textarea
                  id="description"
                  data-testid="textarea-offer-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="অফারের বিস্তারিত বর্ণনা..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="discount_percentage">ছাড় (%) *</Label>
                  <Input
                    id="discount_percentage"
                    data-testid="input-offer-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      discount_percentage: parseFloat(e.target.value) || 0,
                      discount_amount: parseFloat(e.target.value) > 0 ? 0 : prev.discount_amount
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="discount_amount">ছাড় (৳) *</Label>
                  <Input
                    id="discount_amount"
                    data-testid="input-offer-amount"
                    type="number"
                    min="0"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      discount_amount: parseFloat(e.target.value) || 0,
                      discount_percentage: parseFloat(e.target.value) > 0 ? 0 : prev.discount_percentage
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="min_order_amount">মিনিমাম অর্ডার (৳)</Label>
                  <Input
                    id="min_order_amount"
                    data-testid="input-offer-min-order"
                    type="number"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">শুরুর তারিখ</Label>
                  <Input
                    id="start_date"
                    data-testid="input-offer-start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_date">শেষের তারিখ</Label>
                  <Input
                    id="end_date"
                    data-testid="input-offer-end-date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  data-testid="switch-offer-active"
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
                  {editingOffer ? 'আপডেট করুন' : 'যোগ করুন'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Offer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">মোট অফার</p>
                <p className="text-3xl font-bold text-gray-900">{offers.length}</p>
              </div>
              <Gift className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">সক্রিয় অফার</p>
                <p className="text-3xl font-bold text-green-600">{activeOffers.length}</p>
              </div>
              <Star className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">আসন্ন অফার</p>
                <p className="text-3xl font-bold text-blue-600">{upcomingOffers.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">মেয়াদ শেষ</p>
                <p className="text-3xl font-bold text-red-600">{expiredOffers.length}</p>
              </div>
              <Percent className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle>অফার তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          {offers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>শিরোনাম</TableHead>
                  <TableHead>ছাড়</TableHead>
                  <TableHead>মিনিমাম অর্ডার</TableHead>
                  <TableHead>সময়সীমা</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{offer.title_bengali}</p>
                        <p className="text-sm text-gray-500">{offer.title}</p>
                        {offer.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {offer.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {offer.discount_percentage > 0 && (
                          <Badge className="bg-green-100 text-green-800 border-green-300 mb-1">
                            {offer.discount_percentage}% ছাড়
                          </Badge>
                        )}
                        {offer.discount_amount > 0 && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                            {formatPrice(offer.discount_amount)} ছাড়
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {offer.min_order_amount > 0 ? formatPrice(offer.min_order_amount) : 'কোন সীমা নেই'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(offer.start_date).toLocaleDateString('bn-BD')}</p>
                        <p className="text-gray-500">থেকে</p>
                        <p>{new Date(offer.end_date).toLocaleDateString('bn-BD')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={isOfferActive(offer) ? "default" : "secondary"}
                        className={
                          isOfferActive(offer) 
                            ? "bg-green-100 text-green-800 border-green-300" 
                            : new Date(offer.start_date) > new Date()
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }
                      >
                        {isOfferActive(offer) 
                          ? 'সক্রিয়' 
                          : new Date(offer.start_date) > new Date()
                          ? 'আসন্ন'
                          : 'মেয়াদ শেষ'
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(offer)}
                          data-testid={`button-edit-offer-${offer.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(offer.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-offer-${offer.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">কোন অফার পাওয়া যায়নি</p>
              <p className="text-gray-400 text-sm mb-4">
                কাস্টমারদের আকর্ষণ করার জন্য বিশেষ অফার যোগ করুন
              </p>
              <Button 
                onClick={() => openDialog()}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                প্রথম অফার যোগ করুন
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}