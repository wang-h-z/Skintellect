import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types/product';

const CartScreen = () => {
  const navigation = useNavigation();
  const { products, cartItems, addToCart, removeFromCart, getTotalCartItems } = useProducts();

  // Get full product details for items in cart
  const cartProducts = cartItems.map(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    return {
      ...product,
      quantity: cartItem.quantity
    };
  }).filter(item => item) as (Product & { quantity: number })[];

  // Calculate cart total
  const calculateTotal = () => {
    return cartProducts.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    Alert.alert(
      "Checkout",
      "This would proceed to checkout in a real app.",
      [{ text: "OK" }]
    );
  };

  const renderCartItem = ({ item }: { item: Product & { quantity: number } }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => removeFromCart(item.id)}
        >
          <Feather name="minus" size={16} color="#D43F57" />
        </TouchableOpacity>
        
        <Text style={styles.quantity}>{item.quantity}</Text>
        
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => addToCart(item.id)}
        >
          <Feather name="plus" size={16} color="#D43F57" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Feather name="shopping-cart" size={60} color="#FFCDD2" />
      <Text style={styles.emptyText}>Your cart is empty</Text>
      <Text style={styles.emptySubtext}>
        Browse products and add items to your cart
      </Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Shop' as never)}
        style={styles.shopButton}
      >
        Shop Now
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        {cartItems.length > 0 && (
          <Text style={styles.itemCount}>{getTotalCartItems()} items</Text>
        )}
      </View>

      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartProducts}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.cartList}
          />
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Subtotal</Text>
              <Text style={styles.summaryAmount}>${calculateTotal().toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Shipping</Text>
              <Text style={styles.summaryAmount}>$5.99</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalAmount}>${(calculateTotal() + 5.99).toFixed(2)}</Text>
            </View>
            
            <Button 
              mode="contained" 
              onPress={handleCheckout}
              style={styles.checkoutButton}
            >
              Proceed to Checkout
            </Button>
          </View>
        </>
      ) : (
        renderEmptyCart()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FFCDD2',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D43F57',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  cartList: {
    flexGrow: 1,
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  brand: {
    fontSize: 12,
    color: '#666',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D43F57',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#FFCDD2',
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  summaryAmount: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#FFCDD2',
    paddingTop: 10,
    marginTop: 5,
    marginBottom: 15,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D43F57',
  },
  checkoutButton: {
    backgroundColor: '#D43F57',
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
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#D43F57',
  },
});

export default CartScreen;