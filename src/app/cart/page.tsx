"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  // ❌ Right now, cart lives only inside MarketplacePage
  // ✅ So for demo, let’s keep local state here
  const [cart, setCart] = useState<any[]>([
    // Example initial items (later we’ll connect with MarketplacePage)
    { id: 1, name: "Organic Potting Mix", price: "₹300", quantity: 1 },
    { id: 2, name: "Bio Fertilizer", price: "₹150", quantity: 2 },
  ]);

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalPrice = cart.reduce((sum, item) => {
    const price = parseInt(item.price.replace("₹", ""));
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" /> Your Cart
        </h1>
        <Button asChild variant="outline">
          <Link href="/dashboard/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
      </div>

      {cart.length === 0 ? (
        <p className="text-muted-foreground">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map(item => (
            <Card key={item.id}>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{item.name}</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                </Button>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <p>Price: {item.price}</p>
                <p>Qty: {item.quantity}</p>
              </CardContent>
            </Card>
          ))}

          <div className="text-right font-bold text-xl">
            Total: ₹{totalPrice}
          </div>
          <Button className="w-full">Proceed to Checkout</Button>
        </div>
      )}
    </div>
  );
}
