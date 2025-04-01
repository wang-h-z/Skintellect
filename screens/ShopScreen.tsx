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
import { Badge, Button } from 'react-native-paper';
import { supabase } from '../config/supabaseClient';

// Mock data for products
interface Product {
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
}

// Mock product data (in a real app, this would come from your backend)
const mockProducts: Product[] = [
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
    skinConditions: ['acne', 'blackheads'],
    featured: false,
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
    skinConditions: ['hyperpigmentation', 'dullness'],
    featured: true,
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
    skinConditions: ['acne', 'large pores'],
    featured: false,
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
    skinConditions: ['rosacea', 'eczema', 'sunburn'],
    featured: false,
  },
];

const ShopScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<{id: string, quantity: number}[]>([]);

  useEffect(() => {
    // In a real app, you would fetch products from your API
    // For now, we'll just use the mock data
    setProducts(mockProducts);
    
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Fetch user profile for personalized recommendations
    fetchUserProfile();
  }, []);

  useEffect(() => {
    filterProducts(activeFilter);
  }, [products, activeFilter, searchQuery, userProfile]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setUserProfile(data);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
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
        if (userProfile) {
          // Filter by user's skin type and conditions
          const userSkinType = userProfile.skin_type;
          const userSkinConditions = userProfile.skin_conditions || [];
          
          result = result.filter(product => 
            (product.skinType.includes(userSkinType) || product.skinType.includes('all')) &&
            (userSkinConditions.some((condition: string) => product.skinConditions.includes(condition)) || 
             userSkinConditions.length === 0)
          );
        } else {
          // If no user profile, just show featured products
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

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Feather name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        <Button 
          mode="contained" 
          style={styles.addButton}
          onPress={() => addToCart(item.id)}
        >
          Add to Cart
        </Button>
      </View>
    </TouchableOpacity>
  );

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
        <View style={styles.cartIconContainer}>
          <TouchableOpacity>
            <Feather name="shopping-cart" size={24} color="#D43F57" />
            {getTotalCartItems() > 0 && (
              <Badge style={styles.cartBadge}>
                {getTotalCartItems()}
              </Badge>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
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
    marginBottom: 15,
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
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rating: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D43F57',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#D43F57',
    borderRadius: 5,
    marginTop: 'auto',
    height: 30,
    justifyContent: 'center',
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