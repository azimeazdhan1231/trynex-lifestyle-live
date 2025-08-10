import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/constants";
import { Plus, Pencil, Trash2, Award, Percent, Copy } from "lucide-react";
import type { PromoCode, InsertPromoCode } from "@shared/schema";

interface PromoCodeManagementProps {
  promoCodes: PromoCode[];
}

interface PromoCodeFormData {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order_amount: string;
  max_discount: string;
  usage_limit: number;
  expires_at: string;
  is_active: boolean;
}

export default function PromoCodeManagement({ promoCodes }: PromoCodeManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_discount: "",
    usage_limit: 0,
    expires_at: "",
    is_active: true,
  });
  const { toast } = useToast();

  // Create promo code mutation
  const createPromoCodeMutation = useMutation({
    mutationFn: async (data: InsertPromoCode) => {
      return apiRequest("POST", "/api/promo-codes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "সফল",
        description: "প্রোমো কোড সফলভাবে যোগ করা হয়েছে।",
      });
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "প্রোমো কোড যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Update promo code mutation
  const updatePromoCodeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPromoCode> }) => {
      return apiRequest("PATCH", `/api/promo-codes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      setIsDialogOpen(false);
      setEditingPromoCode(null);
      resetForm();
      toast({
        title: "সফল",
        description: "প্রোমো কোড সফলভাবে আপডেট করা হয়েছে।",
      });
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "প্রোমো কোড আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Delete promo code mutation
  const deletePromoCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/promo-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({
        title: "সফল",
        description: "প্রোমো কোড সফলভাবে মুছে ফেলা হয়েছে।",
      });
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "প্রোমো কোড মুছে ফেলতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_amount: "",
      max_discount: "",
      usage_limit: 0,
      expires_at: "",
      is_active: true,
    });
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setFormData({ ...formData, code: result });
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setFormData({
      code: promoCode.code,
      discount_type: promoCode.discount_type as "percentage" | "fixed",
      discount_value: promoCode.discount_value,
      min_order_amount: promoCode.min_order_amount || "",
      max_discount: promoCode.max_discount || "",
      usage_limit: promoCode.usage_limit || 0,
      expires_at: promoCode.expires_at ? new Date(promoCode.expires_at).toISOString().slice(0, 16) : "",
      is_active: promoCode.is_active || true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const promoCodeData: InsertPromoCode = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      min_order_amount: formData.min_order_amount || null,
      max_discount: formData.max_discount || null,
      usage_limit: formData.usage_limit || null,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      is_active: formData.is_active,
    };

    if (editingPromoCode) {
      updatePromoCodeMutation.mutate({ id: editingPromoCode.id, data: promoCodeData });
    } else {
      createPromoCodeMutation.mutate(promoCodeData);
    }
  };

  const handleDelete = (promoCodeId: string) => {
    deletePromoCodeMutation.mutate(promoCodeId);
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "কপি হয়েছে",
        description: `প্রোমো কোড "${code}" ক্লিপবোর্ডে কপি হয়েছে।`,
      });
    } catch (err) {
      toast({
        title: "ত্রুটি",
        description: "কোড কপি করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    setEditingPromoCode(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('bn-BD');
  };

  const isExpired = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>প্রোমো কোড ব্যবস্থাপনা</CardTitle>
              <CardDescription>ডিসকাউন্ট কোড তৈরি এবং ব্যবস্থাপনা করুন</CardDescription>
            </div>
            <Button onClick={openCreateDialog} data-testid="button-add-promo-code">
              <Plus className="h-4 w-4 mr-2" />
              নতুন প্রোমো কোড যোগ করুন
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Promo Codes Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>কোড</TableHead>
                  <TableHead>টাইপ</TableHead>
                  <TableHead>ডিসকাউন্ট</TableHead>
                  <TableHead>ন্যূনতম অর্ডার</TableHead>
                  <TableHead>ব্যবহার</TableHead>
                  <TableHead>মেয়াদ</TableHead>
                  <TableHead>অবস্থা</TableHead>
                  <TableHead>কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promoCode) => (
                  <TableRow key={promoCode.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm" data-testid={`text-promo-code-${promoCode.id}`}>
                          {promoCode.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(promoCode.code)}
                          data-testid={`button-copy-code-${promoCode.id}`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-promo-type-${promoCode.id}`}>
                      {promoCode.discount_type === "percentage" ? "শতাংশ" : "নির্দিষ্ট"}
                    </TableCell>
                    <TableCell data-testid={`text-promo-discount-${promoCode.id}`}>
                      {promoCode.discount_type === "percentage" 
                        ? `${promoCode.discount_value}%` 
                        : formatPrice(Number(promoCode.discount_value))}
                    </TableCell>
                    <TableCell data-testid={`text-promo-min-amount-${promoCode.id}`}>
                      {promoCode.min_order_amount ? formatPrice(Number(promoCode.min_order_amount)) : "—"}
                    </TableCell>
                    <TableCell data-testid={`text-promo-usage-${promoCode.id}`}>
                      {promoCode.used_count || 0}
                      {promoCode.usage_limit && ` / ${promoCode.usage_limit}`}
                    </TableCell>
                    <TableCell data-testid={`text-promo-expiry-${promoCode.id}`}>
                      <div className="flex items-center space-x-2">
                        <span className={isExpired(promoCode.expires_at) ? "text-red-500" : ""}>
                          {formatDate(promoCode.expires_at)}
                        </span>
                        {isExpired(promoCode.expires_at) && (
                          <Badge variant="destructive">মেয়াদ শেষ</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={promoCode.is_active ? "default" : "secondary"}>
                        {promoCode.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(promoCode)}
                          data-testid={`button-edit-promo-${promoCode.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              data-testid={`button-delete-promo-${promoCode.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>প্রোমো কোড মুছে ফেলুন</AlertDialogTitle>
                              <AlertDialogDescription>
                                আপনি কি নিশ্চিত যে আপনি "{promoCode.code}" প্রোমো কোডটি মুছে ফেলতে চান? এটি স্থায়ীভাবে মুছে যাবে।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(promoCode.id)}
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

      {/* Promo Code Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPromoCode ? "প্রোমো কোড সম্পাদনা করুন" : "নতুন প্রোমো কোড যোগ করুন"}
            </DialogTitle>
            <DialogDescription>
              প্রোমো কোডের তথ্য পূরণ করুন এবং সেভ করুন।
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">প্রোমো কোড *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="DISCOUNT10"
                    className="font-mono"
                    data-testid="input-promo-code"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomCode}
                    data-testid="button-generate-code"
                  >
                    জেনারেট
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="discount_type">ডিসকাউন্ট টাইপ *</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, discount_type: value })}
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

              <div>
                <Label htmlFor="discount_value">
                  ডিসকাউন্ট মান * {formData.discount_type === "percentage" ? "(%)" : "(৳)"}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.discount_type === "percentage" ? "10" : "100"}
                  data-testid="input-discount-value"
                />
              </div>

              <div>
                <Label htmlFor="min_order_amount">ন্যূনতম অর্ডার পরিমাণ (৳)</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  placeholder="500"
                  data-testid="input-min-order-amount"
                />
              </div>
            </div>

            <div className="space-y-4">
              {formData.discount_type === "percentage" && (
                <div>
                  <Label htmlFor="max_discount">সর্বোচ্চ ডিসকাউন্ট (৳)</Label>
                  <Input
                    id="max_discount"
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    placeholder="1000"
                    data-testid="input-max-discount"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="usage_limit">ব্যবহারের সীমা</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                  data-testid="input-usage-limit"
                />
              </div>

              <div>
                <Label htmlFor="expires_at">মেয়াদ শেষ</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  data-testid="input-expires-at"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  data-testid="switch-promo-active"
                />
                <Label htmlFor="is_active">সক্রিয় প্রোমো কোড</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              বাতিল
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.code || !formData.discount_value || createPromoCodeMutation.isPending || updatePromoCodeMutation.isPending}
              data-testid="button-save-promo-code"
            >
              {createPromoCodeMutation.isPending || updatePromoCodeMutation.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}