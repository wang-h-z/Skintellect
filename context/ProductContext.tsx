// context/ProductContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, SkinCondition, ScanResult } from '../types/product';
import { products } from '../data/productData';
import { useOnboarding } from './OnboardingContext';
import { supabase } from '../config/supabaseClient';

interface ProductContextType {
  products: Product[];
  scanResults: ScanResult | null;
  setScanResults: (results: ScanResult) => void;
  getRecommendedProducts: () => Product[];
  cartItems: {id: string, quantity: number}[];
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  getTotalCartItems: () => number;
  saveScanResults: () => Promise<void>;
  getPreviousScanResults: () => Promise<ScanResult[]>;
}

// Create the context with undefined as the default value
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Provider component without using React.FC type
export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [productData, setProductData] = useState<Product[]>(products);
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [cartItems, setCartItems] = useState<{id: string, quantity: number}[]>([]);
  const { userProfile } = useOnboarding();

  // Add to cart
  const addToCart = (productId: string) => {
    const existingItem = cartItems.find(item => item.id === productId);
    
    if (existingItem) {
      // Increment quantity if already in cart
      setCartItems(cartItems.map(item => 
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      // Add new item to cart
      setCartItems([...cartItems, { id: productId, quantity: 1 }]);
    }
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    const existingItem = cartItems.find(item => item.id === productId);
    
    if (existingItem && existingItem.quantity > 1) {
      // Decrement quantity
      setCartItems(cartItems.map(item => 
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      ));
    } else {
      // Remove item from cart
      setCartItems(cartItems.filter(item => item.id !== productId));
    }
  };

  // Get total cart items
  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get recommended products based on scan results and user profile
  const getRecommendedProducts = () => {
    // If no scan results or user profile, return featured products
    if (!scanResults && (!userProfile.skinType || userProfile.skinConditions.length === 0)) {
      return productData.filter(product => product.featured);
    }

    const scanConditions: SkinCondition[] = scanResults ? scanResults.skinConditions : [];
    const userConditions: SkinCondition[] = userProfile.skinConditions as SkinCondition[];
    
    // Combine both scan and user conditions (remove duplicates)
    const allConditions = Array.from(new Set([...scanConditions, ...userConditions]));
    
    // Filter products based on conditions
    let recommendedProducts = productData.filter(product => {
      // Check if product targets any of the conditions
      const hasMatchingCondition = product.skinConditions.some(condition => 
        allConditions.includes(condition as any)
      );
      
      // Check if product is suitable for user's skin type
      const isSuitableForSkinType = 
        !userProfile.skinType || 
        product.skinType.includes(userProfile.skinType) || 
        product.skinType.includes('all');
        
      return hasMatchingCondition && isSuitableForSkinType;
    });
    
    // If no products match the filters, return featured products
    if (recommendedProducts.length === 0) {
      recommendedProducts = productData.filter(product => product.featured);
    }
    
    return recommendedProducts;
  };

  // Save scan results to Supabase
  const saveScanResults = async () => {
    if (!scanResults) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('scan_results')
        .insert({
          user_id: user.id,
          skin_conditions: scanResults.skinConditions,
          timestamp: new Date().toISOString()
        });
        
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Error saving scan results:', err);
      throw err;
    }
  };

  // Get previous scan results from Supabase
  const getPreviousScanResults = async (): Promise<ScanResult[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('scan_results')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data.map((item: any) => ({
        skinConditions: item.skin_conditions,
        timestamp: new Date(item.timestamp)
      }));
    } catch (err) {
      console.error('Error fetching scan results:', err);
      return [];
    }
  };

  // Important: Make sure we return the JSX element
  return (
    <ProductContext.Provider value={{
      products: productData,
      scanResults,
      setScanResults,
      getRecommendedProducts,
      cartItems,
      addToCart,
      removeFromCart,
      getTotalCartItems,
      saveScanResults,
      getPreviousScanResults
    }}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use the product context
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};