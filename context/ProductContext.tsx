// context/ProductContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';
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
  refreshCartItems: () => Promise<void>;
  forceSaveCart: () => Promise<void>;
}

// Utility function to deduplicate cart items
const cleanupCartItems = (items: {id: string, quantity: number}[]) => {
  // Create a map to deduplicate items by id
  const itemMap = new Map<string, {id: string, quantity: number}>();
  
  // Process each item, combining quantities for duplicate ids
  items.forEach(item => {
    if (itemMap.has(item.id)) {
      // If this id already exists, add to its quantity
      const existingItem = itemMap.get(item.id)!;
      itemMap.set(item.id, {
        id: item.id,
        quantity: existingItem.quantity + item.quantity
      });
    } else {
      // Otherwise, add it to the map
      itemMap.set(item.id, {
        id: item.id,
        quantity: item.quantity
      });
    }
  });
  
  // Convert map values to array
  return Array.from(itemMap.values());
};

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
      
      console.log("Fetched cart items raw data:", data);
      
      if (data && data.length > 0) {
        // Transform data to match our cart item structure
        const fetchedItems = data.map(item => ({
          id: item.product_id,
          quantity: item.quantity
        }));
        
        // Deduplicate cart items
        const deduplicatedItems = cleanupCartItems(fetchedItems);
        
        console.log("Transformed and deduplicated cart items:", deduplicatedItems);
        setCartItems(deduplicatedItems);
      } else {
        console.log("No cart items found in database, clearing cart");
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error in fetchCartItems:', error);
    }
  };

  // Public function to refresh cart items
  const refreshCartItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchCartItems(user.id);
      } else {
        console.warn('Cannot refresh cart - no authenticated user');
      }
    } catch (error) {
      console.error('Error refreshing cart items:', error);
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

  // Save cart items to Supabase
  const saveCartItems = async () => {
    try {
      console.log("Attempting to save cart items:", cartItems);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn("No authenticated user found when saving cart items");
        return;
      }
      
      console.log("Saving cart for user:", user.id);
      
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
        // Deduplicate cart items before saving
        const deduplicatedItems = cleanupCartItems(cartItems);
        console.log(`Adding ${deduplicatedItems.length} items to cart_items table`);
        
        const cartItemsForDB = deduplicatedItems.map(item => ({
          user_id: user.id,
          product_id: item.id,
          quantity: item.quantity,
          created_at: new Date().toISOString()
        }));
        
        const { data, error: insertError } = await supabase
          .from('cart_items')
          .insert(cartItemsForDB)
          .select();
          
        if (insertError) {
          console.error('Error saving cart items:', insertError);
        } else {
          console.log('Cart items saved successfully:', data);
        }
      } else {
        console.log("No items to save to cart");
      }
    } catch (error) {
      console.error('Error in saveCartItems:', error);
    }
  };

  // Public method to force save cart
  const forceSaveCart = async () => {
    try {
      console.log("Force saving cart...");
      await saveCartItems();
    } catch (error) {
      console.error('Error in forceSaveCart:', error);
    }
  };

  // Save cart items to Supabase whenever they change
  useEffect(() => {
    if (!isInitialized) return; // Skip during initial load
    
    saveCartItems();
  }, [cartItems, isInitialized]);

  // Setup auth state listener to save cart on signout
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change detected:", event);
        if (event === 'SIGNED_OUT') {
          // Save cart before signing out
          console.log("Attempting to save cart before signout");
          await forceSaveCart();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add to cart - with dedupe protection
  const addToCart = (productId: string) => {
    console.log("Adding to cart, product ID:", productId);
    
    // Check if this exact product ID already exists in the cart
    const existingItemIndex = cartItems.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
      // Create a new array to avoid direct state mutation
      const updatedCart = [...cartItems];
      
      // Update the quantity of the existing item
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + 1
      };
      
      console.log(`Increasing quantity for ${productId} to ${updatedCart[existingItemIndex].quantity}`);
      setCartItems(updatedCart);
    } else {
      // Add as new item with quantity 1
      console.log(`Adding new item ${productId} to cart`);
      setCartItems([...cartItems, { id: productId, quantity: 1 }]);
    }
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    console.log("Removing from cart, product ID:", productId);
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
    
    // Cart items will be saved to Supabase via the useEffect
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
          Alert.alert('Error', 'Failed to clear cart. Please try again.');
        } else {
          console.log('Cart cleared successfully in database');
        }
      }
      
      // Clear local state
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      Alert.alert('Error', 'Failed to clear cart. Please try again.');
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
    if (!scanResults) {
      console.warn('No scan results to save');
      return false;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('User not authenticated, cannot save scan');
        return false;
      }
      
      console.log('Saving scan results to Supabase:', {
        user_id: user.id,
        skin_conditions: scanResults.skinConditions,
        timestamp: new Date().toISOString()
      });
      
      const { data, error } = await supabase
        .from('scan_results')
        .insert({
          user_id: user.id,
          skin_conditions: scanResults.skinConditions,
          timestamp: new Date().toISOString()
        })
        .select();
        
      if (error) {
        console.error('Detailed error saving scan results:', error);
        return false;
      }
      
      console.log('Scan results saved successfully:', data);
      return true;
    } catch (err) {
      console.error('Exception saving scan results:', err);
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
      getPreviousScanResults,
      refreshCartItems,
      forceSaveCart
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