import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/constants";
import { Plus, Pencil, Trash2, Award, Copy } from "lucide-react";
import type { PromoCode, InsertPromoCode } from "@shared/schema";

interface PromoCodeManagementProps {
  promoCodes: PromoCode[];
}

interface PromoCodeFormData {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  usage_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export default function PromoCodeManagement({ promoCodes }: PromoCodeManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    min_purchase_amount: 0,
    max_discount_amount: 0,
    usage_limit: 0,
    usage_count: 0,
    start_date: "",
    end_date: "",
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
      toast({
        title: "সফল",
        description: "নতুন প্রমো কোড সফলভাবে যোগ করা হয়েছে।",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "প্রমো কোড যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Update promo code mutation
  const updatePromoCodeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertPromoCode }) => {
      return apiRequest("PATCH", `/api/promo-codes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({
        title: "সফল",
        description: "প্রমো কোড সফলভাবে আপডেট করা হয়েছে।",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "প্রমো কোড আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Delete promo code mutation
  const deletePromoCodeMutation = useMutation({
    mutationFn: async (promoCodeId: string) => {
      return apiRequest("DELETE", `/api/promo-codes/${promoCodeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({
        title: "সফল",
        description: "প্রমো কোড সফলভাবে মুছে ফেলা হয়েছে।",
      });
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "প্রমো কোড মুছতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      min_purchase_amount: 0,
      max_discount_amount: 0,
      usage_limit: 0,
      usage_count: 0,
      start_date: "",
      end_date: "",
      is_active: true,
    });
    setEditingPromoCode(null);
  };

  const handleInputChange = (key: keyof PromoCodeFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generatePromoCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    handleInputChange("code", result);
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "কপি হয়েছে",
      description: `প্রমো কোড "${code}" ক্লিপবোর্ডে কপি করা হয়েছে।`,
    });
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setFormData({
      code: promoCode.code,
      description: promoCode.description || "",
      discount_type: promoCode.discount_type as "percentage" | "fixed",
      discount_value: promoCode.discount_value || 0,
      min_purchase_amount: promoCode.min_purchase_amount || 0,
      max_discount_amount: promoCode.max_discount_amount || 0,
      usage_limit: promoCode.usage_limit || 0,
      usage_count: promoCode.usage_count || 0,
      start_date: promoCode.start_date ? new Date(promoCode.start_date).toISOString().split('T')[0] : "",
      end_date: promoCode.end_date ? new Date(promoCode.end_date).toISOString().split('T')[0] : "",
      is_active: promoCode.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.code.trim()) {
      toast({
        title: "ত্রুটি",
        description: "প্রমো কোড প্রয়োজন।",
        variant: "destructive",
      });
      return;
    }

    if (formData.discount_value <= 0) {
      toast({
        title: "ত্রুটি",
        description: "ছাড়ের পরিমাণ ০ এর বেশি হতে হবে।",
        variant: "destructive",
      });
      return;
    }

    const promoCodeData: InsertPromoCode = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim() || null,
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      min_purchase_amount: formData.min_purchase_amount || null,
      max_discount_amount: formData.max_discount_amount || null,
      usage_limit: formData.usage_limit || null,
      usage_count: formData.usage_count || 0,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
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

  const openCreateDialog = () => {
    setEditingPromoCode(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const activePromoCodes = promoCodes.filter(promo => promo.is_active);
  const expiredPromoCodes = promoCodes.filter(promo => 
    promo.end_date && new Date(promo.end_date) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">মোট প্রমো কোড</p>
                <p className="text-2xl font-bold">{promoCodes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">সক্রিয় প্রমো কোড</p>
                <p className="text-2xl font-bold text-green-600">{activePromoCodes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">মেয়াদ শেষ</p>
                <p className="text-2xl font-bold text-red-600">{expiredPromoCodes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Promo Codes Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>প্রমো কোড ব্যবস্থাপনা</CardTitle>
              <CardDescription>প্রমো কোড যোগ, সম্পাদনা এবং মুছে ফেলুন</CardDescription>
            </div>
            <Button onClick={openCreateDialog} data-testid="button-add-promo-code">
              <Plus className="h-4 w-4 mr-2" />
              নতুন প্রমো কোড যোগ করুন
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
                  <TableHead>বিবরণ</TableHead>
                  <TableHead>ছাড়</TableHead>
                  <TableHead>ব্যবহার</TableHead>
                  <TableHead>মেয়াদ</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promoCode) => (
                  <TableRow key={promoCode.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm font-bold">
                          {promoCode.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyPromoCode(promoCode.code)}
                          data-testid={`button-copy-${promoCode.id}`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {promoCode.description ? (
                        <p className="text-sm max-w-xs truncate">
                          {promoCode.description}
                        </p>
                      ) : (
                        <span className="text-gray-400">কোন বিবরণ নেই</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600">
                        {promoCode.discount_type === "percentage" 
                          ? `${promoCode.discount_value}% ছাড়`
                          : `${formatPrice(promoCode.discount_value || 0)} ছাড়`
                        }
                      </Badge>
                      {promoCode.min_purchase_amount && (
                        <p className="text-xs text-gray-500 mt-1">
                          ন্যূনতম: {formatPrice(promoCode.min_purchase_amount)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{promoCode.usage_count || 0} / {promoCode.usage_limit || "∞"}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: promoCode.usage_limit 
                                ? `${Math.min(((promoCode.usage_count || 0) / promoCode.usage_limit) * 100, 100)}%`
                                : '0%'
                            }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {promoCode.start_date && (
                          <p>শুরু: {new Date(promoCode.start_date).toLocaleDateString('bn-BD')}</p>
                        )}
                        {promoCode.end_date && (
                          <p>শেষ: {new Date(promoCode.end_date).toLocaleDateString('bn-BD')}</p>
                        )}
                        {!promoCode.start_date && !promoCode.end_date && (
                          <span className="text-gray-400">সব সময়</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={promoCode.is_active ? "default" : "secondary"}
                        className={promoCode.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {promoCode.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(promoCode)}
                          data-testid={`button-edit-promo-code-${promoCode.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-delete-promo-code-${promoCode.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>প্রমো কোড মুছে ফেলুন</AlertDialogTitle>
                              <AlertDialogDescription>
                                আপনি কি নিশ্চিত যে আপনি এই প্রমো কোডটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
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

          {promoCodes.length === 0 && (
            <div className="text-center py-8">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">কোনো প্রমো কোড পাওয়া যায়নি।</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Promo Code Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromoCode ? "প্রমো কোড সম্পাদনা করুন" : "নতুন প্রমো কোড যোগ করুন"}
            </DialogTitle>
            <DialogDescription>
              প্রমো কোডের বিস্তারিত তথ্য পূরণ করুন
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">প্রমো কোড *</Label>
              <div className="flex space-x-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                  placeholder="SAVE20"
                  className="font-mono"
                  data-testid="input-promo-code"
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

            <div className="space-y-2">
              <Label htmlFor="description">বিবরণ</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="প্রমো কোডের বিস্তারিত বিবরণ"
                className="min-h-20"
                data-testid="textarea-promo-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_type">ছাড়ের ধরন *</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) => handleInputChange("discount_type", value)}
                >
                  <SelectTrigger data-testid="select-discount-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">শতাংশ (%)</SelectItem>
                    <SelectItem value="fixed">নির্দিষ্ট পরিমাণ (টাকা)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  ছাড়ের পরিমাণ * {formData.discount_type === "percentage" ? "(%)" : "(টাকা)"}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  max={formData.discount_type === "percentage" ? 100 : undefined}
                  value={formData.discount_value}
                  onChange={(e) => handleInputChange("discount_value", parseFloat(e.target.value) || 0)}
                  placeholder={formData.discount_type === "percentage" ? "20" : "500"}
                  data-testid="input-discount-value"
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
                  data-testid="input-min-purchase-promo"
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
                  data-testid="input-max-discount-promo"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usage_limit">ব্যবহারের সীমা</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  min="0"
                  value={formData.usage_limit}
                  onChange={(e) => handleInputChange("usage_limit", parseInt(e.target.value) || 0)}
                  placeholder="100"
                  data-testid="input-usage-limit"
                />
                <p className="text-sm text-gray-600">০ = সীমাহীন</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage_count">ব্যবহৃত সংখ্যা</Label>
                <Input
                  id="usage_count"
                  type="number"
                  min="0"
                  value={formData.usage_count}
                  onChange={(e) => handleInputChange("usage_count", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  disabled={!editingPromoCode}
                  data-testid="input-usage-count"
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
                  data-testid="input-promo-start-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">শেষের তারিখ</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                  data-testid="input-promo-end-date"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">প্রমো কোড সক্রিয় করুন</Label>
                <p className="text-sm text-gray-600">এই প্রমো কোডটি ওয়েবসাইটে ব্যবহারযোগ্য রাখুন</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                data-testid="switch-promo-active"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              বাতিল
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createPromoCodeMutation.isPending || updatePromoCodeMutation.isPending}
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