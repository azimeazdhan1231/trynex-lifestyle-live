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
import { Plus, Pencil, Trash2, Gift, Percent, Calendar, MousePointer } from "lucide-react";
import type { Offer, InsertOffer } from "@shared/schema";

interface OfferManagementProps {
  offers: Offer[];
}

interface OfferFormData {
  title: string;
  description: string;
  image_url: string;
  discount_percentage: number;
  min_order_amount: string;
  button_text: string;
  button_link: string;
  is_popup: boolean;
  popup_delay: number;
  active: boolean;
  expiry: string;
}

export default function OfferManagement({ offers }: OfferManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>({
    title: "",
    description: "",
    image_url: "",
    discount_percentage: 0,
    min_order_amount: "",
    button_text: "অর্ডার করুন",
    button_link: "/products",
    is_popup: false,
    popup_delay: 3000,
    active: true,
    expiry: "",
  });
  const { toast } = useToast();

  // Create offer mutation
  const createOfferMutation = useMutation({
    mutationFn: async (data: InsertOffer) => {
      return apiRequest("POST", "/api/offers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "সফল",
        description: "অফার সফলভাবে যোগ করা হয়েছে।",
      });
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertOffer> }) => {
      return apiRequest("PATCH", `/api/offers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setIsDialogOpen(false);
      setEditingOffer(null);
      resetForm();
      toast({
        title: "সফল",
        description: "অফার সফলভাবে আপডেট করা হয়েছে।",
      });
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
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/offers/${id}`);
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
        description: error.message || "অফার মুছে ফেলতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      discount_percentage: 0,
      min_order_amount: "",
      button_text: "অর্ডার করুন",
      button_link: "/products",
      is_popup: false,
      popup_delay: 3000,
      active: true,
      expiry: "",
    });
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || "",
      image_url: offer.image_url || "",
      discount_percentage: offer.discount_percentage || 0,
      min_order_amount: offer.min_order_amount || "",
      button_text: offer.button_text || "অর্ডার করুন",
      button_link: offer.button_link || "/products",
      is_popup: offer.is_popup || false,
      popup_delay: offer.popup_delay || 3000,
      active: offer.active || true,
      expiry: offer.expiry ? new Date(offer.expiry).toISOString().slice(0, 16) : "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const offerData: InsertOffer = {
      title: formData.title,
      description: formData.description || null,
      image_url: formData.image_url || null,
      discount_percentage: formData.discount_percentage,
      min_order_amount: formData.min_order_amount || null,
      button_text: formData.button_text,
      button_link: formData.button_link,
      is_popup: formData.is_popup,
      popup_delay: formData.popup_delay,
      active: formData.active,
      expiry: formData.expiry ? new Date(formData.expiry).toISOString() : null,
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('bn-BD');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>অফার ব্যবস্থাপনা</CardTitle>
              <CardDescription>বিশেষ অফার তৈরি এবং ব্যবস্থাপনা করুন</CardDescription>
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
                  <TableHead>ডিসকাউন্ট</TableHead>
                  <TableHead>ন্যূনতম অর্ডার</TableHead>
                  <TableHead>টাইপ</TableHead>
                  <TableHead>মেয়াদ</TableHead>
                  <TableHead>অবস্থা</TableHead>
                  <TableHead>কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      {offer.image_url && (
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="w-12 h-12 object-cover rounded"
                          data-testid={`img-offer-${offer.id}`}
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-offer-title-${offer.id}`}>
                      {offer.title}
                    </TableCell>
                    <TableCell data-testid={`text-offer-discount-${offer.id}`}>
                      {offer.discount_percentage}%
                    </TableCell>
                    <TableCell data-testid={`text-offer-min-amount-${offer.id}`}>
                      {offer.min_order_amount ? formatPrice(Number(offer.min_order_amount)) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {offer.is_popup && (
                          <Badge variant="secondary">
                            <MousePointer className="h-3 w-3 mr-1" />
                            পপআপ
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-offer-expiry-${offer.id}`}>
                      {formatDate(offer.expiry)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={offer.active ? "default" : "secondary"}>
                        {offer.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
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
                              variant="destructive"
                              size="sm"
                              data-testid={`button-delete-offer-${offer.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>অফার মুছে ফেলুন</AlertDialogTitle>
                              <AlertDialogDescription>
                                আপনি কি নিশ্চিত যে আপনি "{offer.title}" অফারটি মুছে ফেলতে চান? এটি স্থায়ীভাবে মুছে যাবে।
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
        </CardContent>
      </Card>

      {/* Offer Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingOffer ? "অফার সম্পাদনা করুন" : "নতুন অফার যোগ করুন"}
            </DialogTitle>
            <DialogDescription>
              অফারের তথ্য পূরণ করুন এবং সেভ করুন।
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">শিরোনাম *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="অফারের শিরোনাম"
                  data-testid="input-offer-title"
                />
              </div>

              <div>
                <Label htmlFor="description">বিবরণ</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="অফারের বিবরণ"
                  rows={3}
                  data-testid="textarea-offer-description"
                />
              </div>

              <div>
                <Label htmlFor="image_url">ছবির URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="ছবির লিঙ্ক"
                  data-testid="input-offer-image"
                />
              </div>

              <div>
                <Label htmlFor="discount_percentage">ডিসকাউন্ট শতাংশ *</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                  placeholder="10"
                  data-testid="input-offer-discount"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="min_order_amount">ন্যূনতম অর্ডার পরিমাণ</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  placeholder="500"
                  data-testid="input-offer-min-amount"
                />
              </div>

              <div>
                <Label htmlFor="button_text">বাটন টেক্সট</Label>
                <Input
                  id="button_text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="অর্ডার করুন"
                  data-testid="input-offer-button-text"
                />
              </div>

              <div>
                <Label htmlFor="button_link">বাটন লিঙ্ক</Label>
                <Input
                  id="button_link"
                  value={formData.button_link}
                  onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                  placeholder="/products"
                  data-testid="input-offer-button-link"
                />
              </div>

              <div>
                <Label htmlFor="expiry">মেয়াদ শেষ</Label>
                <Input
                  id="expiry"
                  type="datetime-local"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                  data-testid="input-offer-expiry"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_popup"
                    checked={formData.is_popup}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_popup: checked })}
                    data-testid="switch-offer-popup"
                  />
                  <Label htmlFor="is_popup">পপআপ হিসেবে দেখান</Label>
                </div>

                {formData.is_popup && (
                  <div>
                    <Label htmlFor="popup_delay">পপআপ দেরি (মিলিসেকেন্ড)</Label>
                    <Input
                      id="popup_delay"
                      type="number"
                      value={formData.popup_delay}
                      onChange={(e) => setFormData({ ...formData, popup_delay: parseInt(e.target.value) || 3000 })}
                      placeholder="3000"
                      data-testid="input-offer-popup-delay"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    data-testid="switch-offer-active"
                  />
                  <Label htmlFor="active">সক্রিয় অফার</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              বাতিল
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || createOfferMutation.isPending || updateOfferMutation.isPending}
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