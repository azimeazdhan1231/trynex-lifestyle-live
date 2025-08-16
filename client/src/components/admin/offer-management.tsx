import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/constants";
import { Plus, Pencil, Trash2, Gift, ImageIcon } from "lucide-react";
import type { Offer, InsertOffer } from "@shared/schema";

interface OfferManagementProps {
  offers: Offer[];
}

interface OfferFormData {
  title: string;
  description: string;
  discount_percentage: number;
  discount_amount: number;
  image_url: string;
  min_purchase_amount: number;
  max_discount_amount: number;
  start_date: string;
  end_date: string;
  active: boolean;
  terms_conditions: string;
}

export default function OfferManagement({ offers }: OfferManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>({
    title: "",
    description: "",
    discount_percentage: 0,
    discount_amount: 0,
    image_url: "",
    min_purchase_amount: 0,
    max_discount_amount: 0,
    start_date: "",
    end_date: "",
    active: true,
    terms_conditions: "",
  });
  const { toast } = useToast();

  // Create offer mutation
  const createOfferMutation = useMutation({
    mutationFn: async (data: InsertOffer) => {
      return apiRequest("POST", "/api/offers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "সফল",
        description: "নতুন অফার সফলভাবে যোগ করা হয়েছে।",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "অফার যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Update offer mutation
  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertOffer }) => {
      return apiRequest("PATCH", `/api/offers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "সফল",
        description: "অফার সফলভাবে আপডেট করা হয়েছে।",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "অফার আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Delete offer mutation
  const deleteOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      return apiRequest("DELETE", `/api/offers/${offerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "সফল",
        description: "অফার সফলভাবে মুছে ফেলা হয়েছে।",
      });
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "অফার মুছতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discount_percentage: 0,
      discount_amount: 0,
      image_url: "",
      min_purchase_amount: 0,
      max_discount_amount: 0,
      start_date: "",
      end_date: "",
      active: true,
      terms_conditions: "",
    });
    setEditingOffer(null);
  };

  const handleInputChange = (key: keyof OfferFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || "",
      discount_percentage: offer.discount_percentage || 0,
      discount_amount: offer.discount_amount || 0,
      image_url: offer.image_url || "",
      min_purchase_amount: offer.min_purchase_amount || 0,
      max_discount_amount: offer.max_discount_amount || 0,
      start_date: offer.start_date ? new Date(offer.start_date).toISOString().split('T')[0] : "",
      end_date: offer.end_date ? new Date(offer.end_date).toISOString().split('T')[0] : "",
      active: offer.active !== false,
      terms_conditions: offer.terms_conditions || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({
        title: "ত্রুটি",
        description: "অফারের শিরোনাম প্রয়োজন।",
        variant: "destructive",
      });
      return;
    }

    if (formData.discount_percentage <= 0 && formData.discount_amount <= 0) {
      toast({
        title: "ত্রুটি",
        description: "ছাড়ের পরিমাণ বা শতাংশ প্রয়োজন।",
        variant: "destructive",
      });
      return;
    }

    const offerData: InsertOffer = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      discount_percentage: formData.discount_percentage || null,
      discount_amount: formData.discount_amount || null,
      image_url: formData.image_url.trim() || null,
      min_purchase_amount: formData.min_purchase_amount || null,
      max_discount_amount: formData.max_discount_amount || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      active: formData.active,
      terms_conditions: formData.terms_conditions.trim() || null,
    };

    if (editingOffer) {
      updateOfferMutation.mutate({ id: editingOffer.id, data: offerData });
    } else {
      createOfferMutation.mutate(offerData);
    }
  };

  const handleDelete = (offerId: string) => {
    deleteOfferMutation.mutate(offerId);
  };

  const openCreateDialog = () => {
    setEditingOffer(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const activeOffers = offers.filter(offer => offer.active);
  const expiredOffers = offers.filter(offer => 
    offer.end_date && new Date(offer.end_date) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">মোট অফার</p>
                <p className="text-2xl font-bold">{offers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">সক্রিয় অফার</p>
                <p className="text-2xl font-bold text-green-600">{activeOffers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">মেয়াদ শেষ</p>
                <p className="text-2xl font-bold text-red-600">{expiredOffers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Offers Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>অফার ব্যবস্থাপনা</CardTitle>
              <CardDescription>অফার যোগ, সম্পাদনা এবং মুছে ফেলুন</CardDescription>
            </div>
            <Button onClick={openCreateDialog} data-testid="button-add-offer">
              <Plus className="h-4 w-4 mr-2" />
              নতুন অফার যোগ করুন
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Offers Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ছবি</TableHead>
                  <TableHead>শিরোনাম</TableHead>
                  <TableHead>ছাড়</TableHead>
                  <TableHead>মেয়াদ</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      {offer.image_url ? (
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="w-12 h-12 object-cover rounded"
                          data-testid={`img-offer-${offer.id}`}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{offer.title}</p>
                        {offer.description && (
                          <p className="text-sm text-gray-600 max-w-xs truncate">
                            {offer.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {offer.discount_percentage ? (
                        <Badge variant="outline" className="text-green-600">
                          {offer.discount_percentage}% ছাড়
                        </Badge>
                      ) : offer.discount_amount ? (
                        <Badge variant="outline" className="text-green-600">
                          {formatPrice(offer.discount_amount)} ছাড়
                        </Badge>
                      ) : (
                        <span className="text-gray-400">কোন ছাড় নেই</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {offer.start_date && (
                          <p>শুরু: {new Date(offer.start_date).toLocaleDateString('bn-BD')}</p>
                        )}
                        {offer.end_date && (
                          <p>শেষ: {new Date(offer.end_date).toLocaleDateString('bn-BD')}</p>
                        )}
                        {!offer.start_date && !offer.end_date && (
                          <span className="text-gray-400">সব সময়</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={offer.active ? "default" : "secondary"}
                        className={offer.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {offer.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(offer)}
                          data-testid={`button-edit-offer-${offer.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-delete-offer-${offer.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>অফার মুছে ফেলুন</AlertDialogTitle>
                              <AlertDialogDescription>
                                আপনি কি নিশ্চিত যে আপনি এই অফারটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(offer.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                মুছে ফেলুন
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {offers.length === 0 && (
            <div className="text-center py-8">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">কোনো অফার পাওয়া যায়নি।</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Offer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOffer ? "অফার সম্পাদনা করুন" : "নতুন অফার যোগ করুন"}
            </DialogTitle>
            <DialogDescription>
              অফারের বিস্তারিত তথ্য পূরণ করুন
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">অফারের শিরোনাম *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="বিশেষ ছাড়"
                  data-testid="input-offer-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">ছবির URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange("image_url", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-offer-image"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">বিবরণ</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="অফারের বিস্তারিত বিবরণ"
                className="min-h-20"
                data-testid="textarea-offer-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_percentage">ছাড়ের শতাংশ (%)</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => handleInputChange("discount_percentage", parseFloat(e.target.value) || 0)}
                  placeholder="20"
                  data-testid="input-discount-percentage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_amount">ছাড়ের পরিমাণ (টাকা)</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  min="0"
                  value={formData.discount_amount}
                  onChange={(e) => handleInputChange("discount_amount", parseFloat(e.target.value) || 0)}
                  placeholder="500"
                  data-testid="input-discount-amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_purchase_amount">ন্যূনতম ক্রয় (টাকা)</Label>
                <Input
                  id="min_purchase_amount"
                  type="number"
                  min="0"
                  value={formData.min_purchase_amount}
                  onChange={(e) => handleInputChange("min_purchase_amount", parseFloat(e.target.value) || 0)}
                  placeholder="1000"
                  data-testid="input-min-purchase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_discount_amount">সর্বোচ্চ ছাড় (টাকা)</Label>
                <Input
                  id="max_discount_amount"
                  type="number"
                  min="0"
                  value={formData.max_discount_amount}
                  onChange={(e) => handleInputChange("max_discount_amount", parseFloat(e.target.value) || 0)}
                  placeholder="2000"
                  data-testid="input-max-discount"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">শুরুর তারিখ</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                  data-testid="input-start-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">শেষের তারিখ</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                  data-testid="input-end-date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms_conditions">শর্তাবলী</Label>
              <Textarea
                id="terms_conditions"
                value={formData.terms_conditions}
                onChange={(e) => handleInputChange("terms_conditions", e.target.value)}
                placeholder="অফারের শর্তাবলী"
                className="min-h-20"
                data-testid="textarea-terms-conditions"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">অফার সক্রিয় করুন</Label>
                <p className="text-sm text-gray-600">এই অফারটি ওয়েবসাইটে দেখান</p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleInputChange("active", checked)}
                data-testid="switch-offer-active"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              বাতিল
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createOfferMutation.isPending || updateOfferMutation.isPending}
              data-testid="button-save-offer"
            >
              {createOfferMutation.isPending || updateOfferMutation.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}