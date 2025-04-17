// utils/ingredientAnalyzer.ts
import { Product, SkinCondition, SkinType } from '../types/product';

// Map of skin conditions to ingredients that should be avoided
const ingredientConcerns: Record<SkinCondition | SkinType, string[]> = {
  // Skin conditions
  'acne': ['Isopropyl Myristate', 'Lanolin', 'Mineral Oil'],
  'rosacea': ['Alcohol', 'Witch Hazel', 'Menthol', 'Peppermint', 'Eucalyptus'],
  'eczema': ['Fragrance', 'Alcohol', 'Retinol', 'Alpha Hydroxy Acids'],
  'psoriasis': ['Fragrance', 'Alcohol', 'Salicylic Acid in high concentrations'],
  'hyperpigmentation': ['Hydroquinone' /* for long-term use */],
  'wrinkles': [], // Most anti-aging ingredients are beneficial
  'blackheads': [],
  'dryness': ['Alcohol', 'Salicylic Acid', 'Benzoyl Peroxide'],
  'uneven tone': [],
  'redness': ['Alcohol', 'Menthol', 'Eucalyptus', 'Witch Hazel'],
  'fine lines': [],
  'large pores': [],
  'dullness': [],
  
  // Skin types
  'oily': ['Heavy oils', 'Petroleum', 'Shea Butter'],
  'dry': ['Alcohol', 'Salicylic Acid', 'Benzoyl Peroxide'],
  'combination': [],
  'normal': [],
  'sensitive': ['Fragrance', 'Alcohol', 'Retinol', 'Chemical sunscreens', 'Essential oils']
};

// Map of skin conditions to beneficial ingredients
const ingredientBenefits: Record<SkinCondition | SkinType, string[]> = {
  // Skin conditions
  'acne': ['Salicylic Acid', 'Benzoyl Peroxide', 'Niacinamide', 'Tea Tree Oil', 'Zinc'],
  'rosacea': ['Aloe Vera', 'Chamomile', 'Niacinamide', 'Azelaic Acid', 'Centella Asiatica'],
  'eczema': ['Colloidal Oatmeal', 'Ceramides', 'Hyaluronic Acid', 'Squalane'],
  'psoriasis': ['Salicylic Acid', 'Urea', 'Lactic Acid', 'Aloe Vera'],
  'hyperpigmentation': ['Vitamin C', 'Niacinamide', 'Alpha Arbutin', 'Azelaic Acid', 'Tranexamic Acid'],
  'wrinkles': ['Retinol', 'Peptides', 'Hyaluronic Acid', 'Vitamin C', 'Coenzyme Q10'],
  'blackheads': ['Salicylic Acid', 'Glycolic Acid', 'Niacinamide'],
  'dryness': ['Hyaluronic Acid', 'Ceramides', 'Glycerin', 'Squalane', 'Shea Butter'],
  'uneven tone': ['Vitamin C', 'Niacinamide', 'Alpha Hydroxy Acids', 'Azelaic Acid'],
  'redness': ['Aloe Vera', 'Centella Asiatica', 'Green Tea', 'Licorice Root Extract'],
  'fine lines': ['Retinol', 'Peptides', 'Hyaluronic Acid', 'Vitamin C'],
  'large pores': ['Niacinamide', 'Salicylic Acid', 'Retinol'],
  'dullness': ['Vitamin C', 'Alpha Hydroxy Acids', 'Niacinamide'],
  
  // Skin types
  'oily': ['Niacinamide', 'Salicylic Acid', 'Zinc', 'Hyaluronic Acid'],
  'dry': ['Hyaluronic Acid', 'Ceramides', 'Glycerin', 'Squalane', 'Oils'],
  'combination': ['Niacinamide', 'Hyaluronic Acid', 'Squalane'],
  'normal': ['Hyaluronic Acid', 'Vitamin C', 'Niacinamide'],
  'sensitive': ['Aloe Vera', 'Centella Asiatica', 'Chamomile', 'Hyaluronic Acid', 'Ceramides']
};

/**
 * Analyzes a product's ingredients against user's skin conditions and type
 * @param product The product to analyze
 * @param skinConditions Array of user's skin conditions
 * @param skinType User's skin type
 * @returns Analysis result with suitability score and reasons
 */
export function analyzeProductSuitability(
  product: Product,
  skinConditions: SkinCondition[],
  skinType: SkinType | null
): {
  suitable: boolean;
  score: number; // 0-100
  positives: string[];
  concerns: string[];
  explanation: string;
} {
  const positives: string[] = [];
  const concerns: string[] = [];
  let score = 50; // Start with neutral score
  let suitabilityExplanation = '';

  // Check if product is designed for user's skin type
  if (skinType) {
    if (product.skinType.includes(skinType as string) || product.skinType.includes('all')) {
      score += 20;
      positives.push(`Formulated for ${skinType} skin`);
    } else {
      score -= 15;
      concerns.push(`Not specifically formulated for ${skinType} skin`);
    }
  }

  // Check if product targets any of user's skin conditions
  const matchingConditions = product.skinConditions.filter(condition => 
    skinConditions.includes(condition as SkinCondition)
  );
  
  if (matchingConditions.length > 0) {
    score += 10 * Math.min(matchingConditions.length, 3); // Cap bonus at 30
    positives.push(`Targets ${matchingConditions.join(', ')}`);
  }

  // Analyze ingredient compatibility
  const allConcerns = [...skinConditions];
  if (skinType) allConcerns.push(skinType);
  
  // Check for beneficial ingredients
  const beneficialIngredients: string[] = [];
  allConcerns.forEach(concern => {
    const benefits = ingredientBenefits[concern] || [];
    
    product.ingredients.forEach(ingredient => {
      const ingredientName = ingredient.name.toLowerCase();
      
      benefits.forEach(benefit => {
        if (ingredientName.includes(benefit.toLowerCase()) && !beneficialIngredients.includes(ingredient.name)) {
          beneficialIngredients.push(ingredient.name);
          score += 5; // Bonus for each beneficial ingredient (capped below)
        }
      });
    });
  });
  
  if (beneficialIngredients.length > 0) {
    positives.push(`Contains beneficial ingredients: ${beneficialIngredients.join(', ')}`);
  }

  // Check for concerning ingredients
  const problematicIngredients: string[] = [];
  allConcerns.forEach(concern => {
    const avoidList = ingredientConcerns[concern] || [];
    
    product.ingredients.forEach(ingredient => {
      const ingredientName = ingredient.name.toLowerCase();
      
      avoidList.forEach(avoid => {
        if (ingredientName.includes(avoid.toLowerCase()) && !problematicIngredients.includes(ingredient.name)) {
          problematicIngredients.push(ingredient.name);
          score -= 10; // Penalty for each concerning ingredient
        }
      });
    });
  });

  if (problematicIngredients.length > 0) {
    concerns.push(`Contains ingredients that may not be suitable: ${problematicIngredients.join(', ')}`);
  }

  // Cap score between 0-100
  score = Math.max(0, Math.min(100, score));
  
  // Determine overall suitability
  if (score >= 70) {
    suitabilityExplanation = 'This product is highly suitable for your skin concerns.';
  } else if (score >= 50) {
    suitabilityExplanation = 'This product may be suitable, but consider the listed concerns.';
  } else {
    suitabilityExplanation = 'This product may not be the best match for your skin concerns.';
  }

  return {
    suitable: score >= 50,
    score,
    positives,
    concerns,
    explanation: suitabilityExplanation
  };
}

/**
 * Gets recommended products based on scan results and user profile
 * @param products All available products
 * @param scanConditions Conditions detected from scan
 * @param userSkinType User's skin type from profile
 * @param userConditions Existing conditions from user profile
 * @returns Array of recommended products with suitability analysis
 */
export function getRecommendedProducts(
  products: Product[],
  scanConditions: SkinCondition[],
  userSkinType: SkinType | null,
  userConditions: SkinCondition[]
): Array<Product & { 
  suitability: {
    suitable: boolean;
    score: number;
    positives: string[];
    concerns: string[];
    explanation: string;
  }
}> {
  // Combine scan results with user profile conditions, removing duplicates
  const allConditions = Array.from(new Set([...scanConditions, ...userConditions]));
  
  // Analyze each product
  const analyzedProducts = products.map(product => {
    const suitability = analyzeProductSuitability(product, allConditions, userSkinType);
    return {
      ...product,
      suitability
    };
  });
  
  // Sort by suitability score (highest first)
  return analyzedProducts.sort((a, b) => b.suitability.score - a.suitability.score);
}