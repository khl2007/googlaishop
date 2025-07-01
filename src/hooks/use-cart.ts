
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

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: { id: string; name: string },
    variant: ProductVariant,
    quantity: number
  ) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isTopDrawerOpen: boolean;
  setIsTopDrawerOpen: (isOpen: boolean) => void;
  lastAddedItem: CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTopDrawerOpen, setIsTopDrawerOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

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
      quantity: number
    ) => {
      let newItem: CartItem | null = null;
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) => item.variantId === variant.id
        );
        
        const priceToAdd = (variant.salePrice != null && variant.salePrice > 0) ? variant.salePrice : variant.price;

        if (existingItem) {
          const updatedItems = prevItems.map((item) =>
            item.variantId === variant.id
              ? { ...item, quantity: item.quantity + quantity, price: priceToAdd } // Also update price in case it changed
              : item
          );
           newItem = updatedItems.find(i => i.variantId === variant.id) || null;
           return updatedItems;
        }
         const freshItem: CartItem = {
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          variantName: variant.name,
          price: priceToAdd,
          image: variant.image,
          quantity,
        };
        newItem = freshItem;
        return [...prevItems, freshItem];
      });
      
      if (newItem) {
        setLastAddedItem(newItem);
      }
      setIsTopDrawerOpen(true);
    },
    []
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
    isTopDrawerOpen,
    setIsTopDrawerOpen,
    lastAddedItem,
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
