
"use client";

import type { CartItem, ProductVariant } from "@/lib/types";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useToast } from "./use-toast";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: { id: string; name: string },
    variant: ProductVariant,
    quantity: number,
    options?: { openCart?: boolean }
  ) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);

  const addToCart = useCallback(
    (
      product: { id: string; name: string },
      variant: ProductVariant,
      quantity: number,
      options?: { openCart?: boolean }
    ) => {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) => item.variantId === variant.id
        );
        
        const priceToAdd = (variant.salePrice != null && variant.salePrice > 0) ? variant.salePrice : variant.price;

        if (existingItem) {
          return prevItems.map((item) =>
            item.variantId === variant.id
              ? { ...item, quantity: item.quantity + quantity, price: priceToAdd } // Also update price in case it changed
              : item
          );
        }
        return [
          ...prevItems,
          {
            productId: product.id,
            variantId: variant.id,
            name: product.name,
            variantName: variant.name,
            price: priceToAdd,
            image: variant.image,
            quantity,
          },
        ];
      });
      toast({
        title: "Added to cart",
        description: `${product.name} (${variant.name}) has been added to your cart.`,
      });
      
      // Conditionally open the cart. Default is true.
      if (options?.openCart !== false) {
          setIsCartOpen(true);
      }
    },
    [toast]
  );

  const removeFromCart = useCallback((variantId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.variantId !== variantId)
    );
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setCartItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.variantId !== variantId);
      }
      return prevItems.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const providerValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
  };

  return React.createElement(CartContext.Provider, { value: providerValue }, children);
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
