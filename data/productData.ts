// data/productData.ts
import { Product } from '../types/prodcut';

export const products: Product[] = [
  {
    id: '1',
    name: 'Gentle Foaming Cleanser',
    brand: 'SkinCare Essentials',
    price: 24.99,
    image: 'https://via.placeholder.com/150',
    rating: 4.5,
    description: 'A gentle foaming cleanser that removes impurities without stripping the skin.',
    skinType: ['oily', 'combination', 'normal'],
    skinConditions: ['acne', 'blackheads'],
    featured: true,
    ingredients: [
      {
        name: 'Salicylic Acid',
        benefits: ['Unclogs pores', 'Reduces acne'],
        concerns: ['May cause dryness', 'Not recommended for dry skin'],
        description: 'A beta hydroxy acid (BHA) that exfoliates the skin and clears pores.'
      },
      {
        name: 'Glycerin',
        benefits: ['Hydrating', 'Moisturizing'],
        concerns: [],
        description: 'A humectant that draws water into the skin to maintain hydration.'
      },
      {
        name: 'Tea Tree Oil',
        benefits: ['Antibacterial', 'Anti-inflammatory'],
        concerns: ['May cause irritation in sensitive skin'],
        description: 'Natural essential oil with antibacterial properties to combat acne.'
      }
    ]
  },
  {
    id: '2',
    name: 'Hydrating Serum',
    brand: 'Hydro Boost',
    price: 34.99,
    image: 'https://via.placeholder.com/150',
    rating: 4.8,
    description: 'This hydrating serum contains hyaluronic acid to deeply moisturize the skin.',
    skinType: ['dry', 'normal', 'sensitive'],
    skinConditions: ['dryness', 'rosacea'],
    featured: true,
    ingredients: [
      {
        name: 'Hyaluronic Acid',
        benefits: ['Intense hydration', 'Plumps skin'],
        concerns: [],
        description: 'A powerful humectant that can hold up to 1000x its weight in water.'
      },
      {
        name: 'Ceramides',
        benefits: ['Strengthens skin barrier', 'Reduces moisture loss'],
        concerns: [],
        description: 'Lipids that help maintain skin barrier function and retain moisture.'
      },
      {
        name: 'Aloe Vera',
        benefits: ['Soothing', 'Calming'],
        concerns: [],
        description: 'Natural plant extract with soothing and anti-inflammatory properties.'
      }
    ]
  },
  {
    id: '3',
    name: 'Oil Control Moisturizer',
    brand: 'Clear Skin',
    price: 28.50,
    image: 'https://via.placeholder.com/150',
    rating: 4.3,
    description: 'Lightweight moisturizer that controls oil while providing hydration.',
    skinType: ['oily', 'combination'],
    skinConditions: ['acne', 'blackheads', 'large pores'],
    featured: false,
    ingredients: [
      {
        name: 'Niacinamide',
        benefits: ['Regulates oil production', 'Reduces pore appearance'],
        concerns: [],
        description: 'Vitamin B3 that helps regulate sebum production and minimize pores.'
      },
      {
        name: 'Zinc PCA',
        benefits: ['Sebum control', 'Antibacterial'],
        concerns: [],
        description: 'Helps control oil production and has antimicrobial properties.'
      },
      {
        name: 'Salicylic Acid',
        benefits: ['Unclogs pores', 'Reduces acne'],
        concerns: ['May cause dryness', 'Not recommended for dry skin'],
        description: 'A beta hydroxy acid (BHA) that exfoliates the skin and clears pores.'
      }
    ]
  },
  {
    id: '4',
    name: 'Vitamin C Brightening Serum',
    brand: 'Glow Getter',
    price: 42.99,
    image: 'https://via.placeholder.com/150',
    rating: 4.7,
    description: 'This serum brightens skin and reduces dark spots with vitamin C.',
    skinType: ['all'],
    skinConditions: ['hyperpigmentation', 'dullness', 'uneven tone'],
    featured: true,
    ingredients: [
      {
        name: 'Vitamin C (Ascorbic Acid)',
        benefits: ['Brightens skin', 'Fights free radicals', 'Reduces dark spots'],
        concerns: ['May cause irritation in sensitive skin'],
        description: 'Powerful antioxidant that brightens skin and reduces hyperpigmentation.'
      },
      {
        name: 'Vitamin E',
        benefits: ['Antioxidant', 'Moisturizing'],
        concerns: [],
        description: 'Works synergistically with Vitamin C to enhance its effectiveness.'
      },
      {
        name: 'Ferulic Acid',
        benefits: ['Stabilizes other antioxidants', 'Enhances UV protection'],
        concerns: [],
        description: 'Helps stabilize vitamin C and enhances its photoprotection capabilities.'
      }
    ]
  },
  {
    id: '5',
    name: 'Niacinamide Treatment',
    brand: 'SkinCare Science',
    price: 19.99,
    image: 'https://via.placeholder.com/150',
    rating: 4.4,
    description: 'Targets blemishes and minimizes pores with 10% niacinamide.',
    skinType: ['oily', 'combination', 'normal'],
    skinConditions: ['acne', 'large pores', 'uneven tone'],
    featured: false,
    ingredients: [
      {
        name: 'Niacinamide',
        benefits: ['Regulates oil', 'Reduces pore appearance', 'Evens skin tone'],
        concerns: [],
        description: 'Vitamin B3 that helps with multiple skin concerns including oil control and pore size.'
      },
      {
        name: 'Zinc PCA',
        benefits: ['Oil control', 'Anti-inflammatory'],
        concerns: [],
        description: 'Helps regulate sebum production and calms inflammation.'
      },
      {
        name: 'Panthenol',
        benefits: ['Hydrating', 'Soothing'],
        concerns: [],
        description: 'Pro-Vitamin B5 that moisturizes and soothes skin.'
      }
    ]
  },
  {
    id: '6',
    name: 'Soothing Aloe Gel',
    brand: 'Calm Skin',
    price: 16.50,
    image: 'https://via.placeholder.com/150',
    rating: 4.2,
    description: 'Calming gel that soothes irritation and reduces redness.',
    skinType: ['sensitive', 'normal', 'dry'],
    skinConditions: ['rosacea', 'eczema', 'redness'],
    featured: false,
    ingredients: [
      {
        name: 'Aloe Vera',
        benefits: ['Soothing', 'Hydrating', 'Anti-inflammatory'],
        concerns: [],
        description: 'Natural ingredient with calming and moisturizing properties.'
      },
      {
        name: 'Chamomile Extract',
        benefits: ['Calming', 'Anti-redness'],
        concerns: [],
        description: 'Plant extract with anti-inflammatory and soothing effects.'
      },
      {
        name: 'Allantoin',
        benefits: ['Healing', 'Soothing'],
        concerns: [],
        description: 'Helps heal and protect irritated skin.'
      }
    ]
  },
  {
    id: '7',
    name: 'Retinol Renewal Night Cream',
    brand: 'Age Defying',
    price: 38.99,
    image: 'https://via.placeholder.com/150',
    rating: 4.6,
    description: 'Anti-aging night cream with retinol to reduce fine lines and wrinkles.',
    skinType: ['normal', 'combination', 'dry'],
    skinConditions: ['wrinkles', 'fine lines', 'uneven tone'],
    featured: true,
    ingredients: [
      {
        name: 'Retinol',
        benefits: ['Reduces fine lines', 'Promotes cell turnover', 'Improves texture'],
        concerns: ['May cause irritation', 'Increases sun sensitivity', 'Not recommended for sensitive skin'],
        description: 'Vitamin A derivative that accelerates cell renewal and stimulates collagen production.'
      },
      {
        name: 'Peptides',
        benefits: ['Stimulates collagen', 'Firms skin'],
        concerns: [],
        description: 'Small proteins that signal the skin to produce more collagen.'
      },
      {
        name: 'Shea Butter',
        benefits: ['Deeply moisturizing', 'Nourishing'],
        concerns: ['May be too heavy for oily skin'],
        description: 'Rich emollient that provides deep moisture and nourishment.'
      }
    ]
  },
  {
    id: '8',
    name: 'Hyaluronic Acid Moisture Gel',
    brand: 'Water Surge',
    price: 29.99,
    image: 'https://via.placeholder.com/150',
    rating: 4.5,
    description: 'Lightweight gel moisturizer with multiple molecular weights of hyaluronic acid.',
    skinType: ['all'],
    skinConditions: ['dryness', 'fine lines'],
    featured: true,
    ingredients: [
      {
        name: 'Hyaluronic Acid (Multi-weight)',
        benefits: ['Deep hydration', 'Plumps skin', 'Reduces fine lines'],
        concerns: [],
        description: 'Different molecular weights penetrate different skin layers for comprehensive hydration.'
      },
      {
        name: 'Glycerin',
        benefits: ['Hydrating', 'Moisturizing'],
        concerns: [],
        description: 'Humectant that attracts and retains moisture in the skin.'
      },
      {
        name: 'B5 (Panthenol)',
        benefits: ['Soothing', 'Healing', 'Hydrating'],
        concerns: [],
        description: 'Helps heal and hydrate the skin while reducing inflammation.'
      }
    ]
  }
];