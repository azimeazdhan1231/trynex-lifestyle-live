import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, Gift } from "lucide-react";
import { formatPrice } from "@/lib/constants";

interface CartSummaryProps {
  totalPrice: number;
  deliveryCharge: number;
  deliveryThreshold: number;
  finalTotal: number;
}

export default function CartSummary({ 
  totalPrice, 
  deliveryCharge, 
  deliveryThreshold, 
  finalTotal 
}: CartSummaryProps) {
  return (
    <Card className="bg-gradient-to-r from-gray-50 to-orange-50 border border-orange-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-bold text-gray-900">অর্ডার সারাংশ</h3>
        </div>
        
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-gray-700">
            <span>পণ্যের মূল্য:</span>
            <span className="font-semibold">{formatPrice(totalPrice)}</span>
          </div>
          
          {/* Delivery */}
          <div className="flex justify-between text-gray-700">
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              ডেলিভারি চার্জ:
            </span>
            <span className={`font-semibold ${deliveryCharge === 0 ? "text-green-600" : ""}`}>
              {deliveryCharge === 0 ? "ফ্রি!" : formatPrice(deliveryCharge)}
            </span>
          </div>

          {/* Free Delivery Progress */}
          {totalPrice < deliveryThreshold && (
            <div className="text-xs text-orange-700 bg-orange-100 p-3 rounded-lg border border-orange-300">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span>আরও {formatPrice(deliveryThreshold - totalPrice)} কিনলে ফ্রি ডেলিভারি পাবেন!</span>
              </div>
              <div className="mt-2 bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((totalPrice / deliveryThreshold) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Free Delivery Achieved */}
          {deliveryCharge === 0 && (
            <div className="text-sm text-green-700 bg-green-100 p-3 rounded-lg border border-green-300">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span className="font-semibold">🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন!</span>
              </div>
            </div>
          )}
          
          <Separator />
          
          {/* Total */}
          <div className="flex justify-between items-center text-xl font-bold">
            <span className="text-gray-900">সর্বমোট:</span>
            <span className="text-green-600 text-2xl">{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}