import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Badge, Button, Chip } from 'react-native-paper';
import { supabase } from '../config/supabaseClient';
import { useProducts } from '../context/ProductContext';
import { useOnboarding } from '../context/OnboardingContext';
import { Product, SkinCondition } from '../types/product';
import ProductDetailModal from '../components/ProductDetailModal';
import { getRecommendedProducts } from '../utils/IngredientAnalyzer';
import CartButton from '../components/CartButton';
import CartModal from '../components/CartModal';

const ShopScreen = () => {
  const { products, scanResults, addToCart, getTotalCartItems } = useProducts();
  const { userProfile } = useOnboarding();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  
  // New state for recommended products based on skin scan
  const [recommendedProducts, setRecommendedProducts] = useState<Array<Product & { suitability: any }>>([]);
  const [hasNewScan, setHasNewScan] = useState(false);

  useEffect(() => {
    // Check if there's a recent scan
    if (scanResults && scanResults.timestamp) {
      const scanTime = new Date(scanResults.timestamp).getTime();
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - scanTime;
      
      // If scan is less than 1 hour old, consider it new
      if (timeDifference < 60 * 60 * 1000) {
        setHasNewScan(true);
      }
    }
    
    // In a real app, you would fetch products from your API
    // For now, we'll just simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Generate recommended products based on scan and profile
    generateRecommendations();
    
  }, [scanResults, userProfile, products]);

  useEffect(() => {
    filterProducts(activeFilter);
  }, [products, activeFilter, searchQuery, recommendedProducts, userProfile]);

  const generateRecommendations = () => {
    const scanConditions = scanResults ? scanResults.skinConditions : [];
    const userConditions = userProfile.skinConditions as SkinCondition[];
    const userSkinType = userProfile.skinType;
    
    const recommendations = getRecommendedProducts(
      products,
      scanConditions,
      userSkinType,
      userConditions
    );
    
    setRecommendedProducts(recommendations);
  };

  const filterProducts = (filter: string) => {
    let result = [...products];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.brand.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    switch (filter) {
      case 'recommended':
        // Use our analyzed recommended products
        if (recommendedProducts.length > 0) {
          // Extract just the product data (without suitability)
          result = recommendedProducts.map(item => ({
            id: item.id,
            name: item.name,
            brand: item.brand,
            price: item.price,
            image: item.image,
            rating: item.rating,
            description: item.description,
            skinType: item.skinType,
            skinConditions: item.skinConditions,
            featured: item.featured,
            ingredients: item.ingredients
          }));
        } else {
          // Fallback to featured products if no recommendations
          result = result.filter(product => product.featured);
        }
        break;
        
      case 'featured':
        result = result.filter(product => product.featured);
        break;
        
      case 'bestsellers':
        // In a real app, you'd have actual bestseller data
        // For now, sort by rating as a proxy
        result = result.sort((a, b) => b.rating - a.rating);
        break;
        
      case 'all':
        // No additional filtering needed
        break;
    }
    
    setFilteredProducts(result);
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const renderCategoryButton = (title: string, category: string) => (
    <TouchableOpacity 
      style={[
        styles.categoryButton, 
        activeFilter === category && styles.activeCategoryButton
      ]}
      onPress={() => setActiveFilter(category)}
    >
      <Text style={[
        styles.categoryButtonText,
        activeFilter === category && styles.activeCategoryButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    // Find the suitability info if it exists
    const recommendedItem = recommendedProducts.find(p => p.id === item.id);
    const hasSuitabilityInfo = !!recommendedItem;
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        activeOpacity={0.8}
        onPress={() => handleProductPress(item)}
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        
        {hasSuitabilityInfo && activeFilter === 'recommended' && (
          <View style={[
            styles.compatibilityBadge, 
            { 
              backgroundColor: 
                recommendedItem.suitability.score >= 70 ? '#4CAF50' : 
                recommendedItem.suitability.score >= 50 ? '#FF9800' : '#F44336'
            }
          ]}>
            <Text style={styles.compatibilityScore}>
              {recommendedItem.suitability.score}%
            </Text>
          </View>
        )}
        
        <View style={styles.productInfo}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.productName}>{item.name}</Text>
          
          <View style={styles.priceRatingRow}>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            <View style={styles.ratingContainer}>
              <Feather name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => addToCart(item.id)}
          >
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D43F57" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <TouchableOpacity 
          style={styles.cartIconContainer}
          onPress={() => setCartModalVisible(true)}
        >
          <Feather name="shopping-cart" size={24} color="#D43F57" />
          {getTotalCartItems() > 0 && (
            <Badge style={styles.cartBadge}>
              {getTotalCartItems()}
            </Badge>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Show scan result banner if there's a new scan */}
      {hasNewScan && scanResults && (
        <View style={styles.scanBanner}>
          <Feather name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.scanBannerText}>
            Products recommended based on your recent skin scan
          </Text>
        </View>
      )}
      
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.categoriesContainer}>
        {renderCategoryButton('Recommended', 'recommended')}
        {renderCategoryButton('Featured', 'featured')}
        {renderCategoryButton('Best Sellers', 'bestsellers')}
        {renderCategoryButton('All Products', 'all')}
      </View>
      
      {/* Display skin concerns as chips when filter is on recommended */}
      {activeFilter === 'recommended' && ((scanResults?.skinConditions?.length ?? 0) > 0 || userProfile.skinConditions.length > 0) && (
  <View style={styles.concernsContainer}>
    <Text style={styles.concernsLabel}>Products for your skin concerns:</Text>
    <View style={styles.chipsContainer}>
      {scanResults?.skinConditions?.map((condition, index) => (
        <Chip 
          key={`scan-${index}`} 
          style={styles.concernChip}
          textStyle={styles.concernChipText}
          icon={() => <Feather name="camera" size={16} color="#D43F57" />}
        >
          {condition}
        </Chip>
      ))}
      {userProfile.skinConditions.map((condition, index) => {
        // Skip if already shown from scan results
        if (scanResults?.skinConditions?.includes(condition as SkinCondition)) {
          return null;
        }
        return (
          <Chip 
            key={`profile-${index}`} 
            style={styles.concernChip}
            textStyle={styles.concernChipText}
            icon={() => <Feather name="user" size={16} color="#D43F57" />}
          >
            {condition}
          </Chip>
        );
      })}
    </View>
  </View>
)}
      
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-bag" size={60} color="#FFCDD2" />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your filters or search query
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
        />
      )}
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={closeModal}
        onAddToCart={addToCart}
      />

      <CartModal
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FFCDD2',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D43F57',
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#D43F57',
    fontSize: 10,
  },
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#E8F5E9',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
  },
  scanBannerText: {
    color: '#2E7D32',
    marginLeft: 10,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    margin: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  activeCategoryButton: {
    backgroundColor: '#D43F57',
    borderColor: '#D43F57',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeCategoryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  concernsContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  concernsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  concernChip: {
    margin: 4,
    backgroundColor: '#FFF0F0',
  },
  concernChipText: {
    color: '#D43F57',
  },
  productList: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    minHeight: 290,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    height: 40,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D43F57',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  addButton: {
    backgroundColor: '#D43F57',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    width: '100%',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compatibilityScore: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ShopScreen;