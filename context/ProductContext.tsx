// context/ProductContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, SkinCondition, ScanResult } from '../types/product';
import { products } from '../data/productData';
import { useOnboarding } from './OnboardingContext';
import { supabase } from '../config/supabaseClient';

// Define your context types
interface ProductContextType {
  products: Product[];
  scanResults: ScanResult | null;
  setScanResults: (results: ScanResult) => void;
  getRecommendedProducts: () => Product[];
  cartItems: {id: string, quantity: number}[];
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getTotalCartItems: () => number;
  saveScanResults: () => Promise<boolean>;
  getPreviousScanResults: () => Promise<ScanResult[]>;
}

// Create the context with undefined as the default value
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Provider component
export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [productData, setProductData] = useState<Product[]>(products);
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [cartItems, setCartItems] = useState<{id: string, quantity: number}[]>([]);
  const { userProfile } = useOnboarding();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from Supabase when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await Promise.all([
            fetchCartItems(user.id),
            fetchLatestScanResult(user.id)
          ]);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading user data:', error);
        setIsInitialized(true);
      }
    };

    loadUserData();
  }, []);

  // Fetch cart items from Supabase
  const fetchCartItems = async (userId: string) => {
    try {
      console.log("Fetching cart items for user:", userId);
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching cart items:', error);
        return;
      }
      
      console.log("Fetched cart items data:", data);
      
      if (data && data.length > 0) {
        // Transform data to match our cart item structure
        const fetchedItems = data.map(item => ({
          id: item.product_id,
          quantity: item.quantity
        }));
        
        console.log("Setting cart items to:", fetchedItems);
        setCartItems(fetchedItems);
      } else {
        console.log("No cart items found in database");
      }
    } catch (error) {
      console.error('Error in fetchCartItems:', error);
    }
  };

  // Fetch the latest scan result from Supabase
  const fetchLatestScanResult = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('scan_results')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching scan results:', error);
        return;
      }
      
      if (data) {
        // Transform to match our scan result structure
        setScanResults({
          skinConditions: data.skin_conditions,
          timestamp: new Date(data.timestamp)
        });
      }
    } catch (error) {
      console.error('Error in fetchLatestScanResult:', error);
    }
  };

  // Save cart items to Supabase whenever they change
  useEffect(() => {
    if (!isInitialized) return; // Skip during initial load
    
    const saveCartItems = async () => {
      try {
        console.log("Attempting to save cart items:", cartItems);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // First delete existing cart items for this user
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
          
        if (deleteError) {
          console.error('Error deleting existing cart items:', deleteError);
          return;
        }
        
        // Then insert the new cart items
        if (cartItems.length > 0) {
          const cartItemsForDB = cartItems.map(item => ({
            user_id: user.id,
            product_id: item.id,
            quantity: item.quantity,
            created_at: new Date().toISOString()
          }));
          
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert(cartItemsForDB);
            
          if (insertError) {
            console.error('Error saving cart items:', insertError);
          }
        }
      } catch (error) {
        console.error('Error in saveCartItems:', error);
      }
    };

    saveCartItems();
  }, [cartItems, isInitialized]);

  // Add to cart
  const addToCart = (productId: string) => {
    console.log("Adding to cart, product ID:", productId);
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

  // Clear cart
  const clearCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Delete all cart items for this user
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error clearing cart in database:', error);
        }
      }
      
      // Clear local state
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
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
    if (!scanResults) return false;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Saving scan results to Supabase:', {
        user_id: user.id,
        skin_conditions: scanResults.skinConditions,
        timestamp: new Date().toISOString()
      });
      
      const { error } = await supabase
        .from('scan_results')
        .insert({
          user_id: user.id,
          skin_conditions: scanResults.skinConditions,
          timestamp: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error inserting scan results:', error);
        throw error;
      }
      
      console.log('Scan results saved successfully');
      return true;
    } catch (err) {
      console.error('Error saving scan results:', err);
      return false;
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

  // Run a test to directly fetch cart items
  useEffect(() => {
    const testCartFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user");
        return;
      }
      
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);
        
      console.log("Direct cart fetch test:", { data, error });
    };

    if (isInitialized) {
      testCartFetch();
    }
  }, [isInitialized]);

  return (
    <ProductContext.Provider value={{
      products: productData,
      scanResults,
      setScanResults,
      getRecommendedProducts,
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
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