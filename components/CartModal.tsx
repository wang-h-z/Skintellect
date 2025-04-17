import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Button } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types/product';

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ visible, onClose }) => {
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
    onClose(); // Close the modal
    // Navigate or perform checkout actions
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
          <Feather name="minus" size={14} color="#D43F57" />
        </TouchableOpacity>
        
        <Text style={styles.quantity}>{item.quantity}</Text>
        
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => addToCart(item.id)}
        >
          <Feather name="plus" size={14} color="#D43F57" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Feather name="shopping-cart" size={50} color="#FFCDD2" />
      <Text style={styles.emptyText}>Your cart is empty</Text>
      <Text style={styles.emptySubtext}>
        Browse products and add items to your cart
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {cartItems.length > 0 ? (
            <>
              <Text style={styles.itemCount}>{getTotalCartItems()} items</Text>
              
              <FlatList
                data={cartProducts}
                renderItem={renderCartItem}
                keyExtractor={item => item.id}
                style={styles.cartList}
                contentContainerStyle={styles.cartListContent}
              />
              
              <View style={styles.footer}>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
                </View>
                
                <Button 
                  mode="contained" 
                  onPress={handleCheckout}
                  style={styles.checkoutButton}
                >
                  Checkout
                </Button>
              </View>
            </>
          ) : (
            renderEmptyCart()
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
    flex: 1,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D43F57',
  },
  closeButton: {
    padding: 5,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginLeft: 15,
  },
  cartList: {
    flex: 1,
  },
  cartListContent: {
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
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    paddingHorizontal: 15,
  },
  brand: {
    fontSize: 12,
    color: '#666',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 3,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D43F57',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#FFCDD2',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'center',
  },
  totalLabel: {
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
});

export default CartModal;