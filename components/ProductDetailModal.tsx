// components/ProductDetailModal.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal
} from 'react-native';
import { Button } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { Product, SkinCondition, SkinType } from '../types/product';
import { useOnboarding } from '../context/OnboardingContext';
import { useProducts } from '../context/ProductContext';
import { analyzeProductSuitability } from '../utils/IngredientAnalyzer'

interface ProductDetailModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  visible,
  product,
  onClose,
  onAddToCart
}) => {
  const { userProfile } = useOnboarding();
  const { scanResults } = useProducts();

  if (!product) return null;

  // Combine scan results with user profile for suitability analysis
  const userConditions = userProfile.skinConditions as SkinCondition[];
  const scanConditions = scanResults ? scanResults.skinConditions : [];
  const allConditions = Array.from(new Set([...userConditions, ...scanConditions])) as SkinCondition[];
  
  // Analyze product suitability
  const suitabilityResult = analyzeProductSuitability(
    product,
    allConditions,
    userProfile.skinType as SkinType
  );

  // Get color based on suitability score
  const getSuitabilityColor = (score: number) => {
    if (score >= 70) return '#4CAF50'; // Good match - green
    if (score >= 50) return '#FF9800'; // Moderate match - orange
    return '#F44336'; // Poor match - red
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color="#333" />
          </TouchableOpacity>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            
            <View style={styles.productHeader}>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.productName}>{product.name}</Text>
              
              <View style={styles.priceRatingRow}>
                <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                <View style={styles.ratingContainer}>
                  <Feather name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
                </View>
              </View>
            </View>
            
            <View style={[styles.suitabilityContainer, { borderColor: getSuitabilityColor(suitabilityResult.score) }]}>
              <Text style={[styles.suitabilityScore, { color: getSuitabilityColor(suitabilityResult.score) }]}>
                Compatibility Score: {suitabilityResult.score}/100
              </Text>
              <Text style={styles.suitabilityExplanation}>{suitabilityResult.explanation}</Text>
            </View>
            
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
            
            <View style={styles.suitabilityDetails}>
              <Text style={styles.sectionTitle}>Product Analysis</Text>
              
              {suitabilityResult.positives.length > 0 && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Benefits for Your Skin:</Text>
                  {suitabilityResult.positives.map((positive, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Feather name="check-circle" size={16} color="#4CAF50" style={styles.benefitIcon} />
                      <Text style={styles.benefitText}>{positive}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {suitabilityResult.concerns.length > 0 && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Potential Concerns:</Text>
                  {suitabilityResult.concerns.map((concern, index) => (
                    <View key={index} style={styles.concernItem}>
                      <Feather name="alert-circle" size={16} color="#F44336" style={styles.concernIcon} />
                      <Text style={styles.concernText}>{concern}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            
            <View style={styles.ingredientsContainer}>
              <Text style={styles.sectionTitle}>Key Ingredients</Text>
              
              {product.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.ingredientDescription}>{ingredient.description}</Text>
                  
                  {ingredient.benefits.length > 0 && (
                    <View style={styles.benefitsContainer}>
                      <Text style={styles.benefitsTitle}>Benefits:</Text>
                      <View style={styles.benefitsList}>
                        {ingredient.benefits.map((benefit, bIndex) => (
                          <View key={bIndex} style={styles.ingredientBenefit}>
                            <Feather name="plus" size={14} color="#4CAF50" />
                            <Text style={styles.benefitText}>{benefit}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {ingredient.concerns.length > 0 && (
                    <View style={styles.concernsContainer}>
                      <Text style={styles.concernsTitle}>Note:</Text>
                      <View style={styles.concernsList}>
                        {ingredient.concerns.map((concern, cIndex) => (
                          <View key={cIndex} style={styles.ingredientConcern}>
                            <Feather name="info" size={14} color="#FF9800" />
                            <Text style={styles.concernText}>{concern}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
            
            <View style={styles.actionButtonsContainer}>
              <Button 
                mode="contained" 
                onPress={() => onAddToCart(product.id)}
                style={styles.addToCartButton}
              >
                Add to Cart
              </Button>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  productHeader: {
    padding: 15,
    backgroundColor: 'white',
  },
  brand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D43F57',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  suitabilityContainer: {
    margin: 15,
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  suitabilityScore: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  suitabilityExplanation: {
    fontSize: 14,
    color: '#666',
  },
  descriptionContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  suitabilityDetails: {
    padding: 15,
    backgroundColor: 'white',
  },
  detailsSection: {
    marginBottom: 15,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    marginRight: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  concernItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  concernIcon: {
    marginRight: 10,
  },
  concernText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  ingredientsContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  ingredientItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ingredientDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  benefitsContainer: {
    marginBottom: 8,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  benefitsList: {
    marginLeft: 10,
  },
  ingredientBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  concernsContainer: {
    marginTop: 5,
  },
  concernsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 5,
  },
  concernsList: {
    marginLeft: 10,
  },
  ingredientConcern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  actionButtonsContainer: {
    padding: 15,
    backgroundColor: 'white',
    paddingBottom: 30, // Extra padding at the bottom
  },
  addToCartButton: {
    backgroundColor: '#D43F57',
  },
});

export default ProductDetailModal;