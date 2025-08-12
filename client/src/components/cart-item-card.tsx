import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2, Package } from "lucide-react";
import { formatPrice } from "@/lib/constants";

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
    image?: string;
    customization?: {
      text?: string;
      color?: string;
      size?: string;
      [key: string]: any;
    };
  };
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItemCard({ item, onQuantityChange, onRemove }: CartItemProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      onRemove(item.id);
    } else {
      onQuantityChange(item.id, newQuantity);
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <img
              src={item.image_url || item.image}
              alt={item.name}
              className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-product.png';
              }}
            />
          </div>
          
          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
              {item.name}
            </h4>
            <p className="text-lg font-bold text-orange-600 mb-2">
              {formatPrice(item.price)} / টি
            </p>
            
            {/* Customization Display */}
            {item.customization && (
              <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-3 h-3 text-blue-600" />
                  <Badge variant="outline" className="bg-white text-blue-800 border-blue-300 text-xs font-medium">
                    কাস্টমাইজড
                  </Badge>
                </div>
                <div className="text-xs text-blue-700 space-y-1 font-medium">
                  {item.customization.text && (
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <strong>টেক্সট:</strong> "{item.customization.text}"
                    </p>
                  )}
                  {item.customization.color && (
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <strong>রং:</strong> {item.customization.color}
                    </p>
                  )}
                  {item.customization.size && (
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <strong>সাইজ:</strong> {item.customization.size}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Item Total Price */}
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                মোট: {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>

          {/* Quantity Controls & Actions */}
          <div className="flex flex-col items-end gap-3">
            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all duration-200"
              data-testid={`button-remove-${item.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            
            {/* Quantity Controls */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="w-8 h-8 p-0 hover:bg-gray-200 rounded-md transition-colors"
                data-testid={`button-decrease-${item.id}`}
              >
                <Minus className="w-3 h-3" />
              </Button>
              
              <span className="w-8 text-center font-bold text-sm bg-white px-2 py-1 rounded border">
                {item.quantity}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="w-8 h-8 p-0 hover:bg-gray-200 rounded-md transition-colors"
                data-testid={`button-increase-${item.id}`}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}