// types/product.ts

export interface Ingredient {
    name: string;
    benefits: string[];
    concerns: string[];
    description: string;
  }
  
  export interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
    rating: number;
    description: string;
    skinType: string[];
    skinConditions: string[];
    featured: boolean;
    ingredients: Ingredient[];
  }
  
  export type SkinType = 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';
  export type SkinCondition = 
    | 'acne' 
    | 'rosacea' 
    | 'eczema' 
    | 'psoriasis' 
    | 'hyperpigmentation' 
    | 'wrinkles' 
    | 'blackheads' 
    | 'dryness' 
    | 'uneven tone'
    | 'redness'
    | 'fine lines'
    | 'large pores'
    | 'dullness';
  
  export interface ScanResult {
    skinConditions: SkinCondition[];
    timestamp: Date;
  }