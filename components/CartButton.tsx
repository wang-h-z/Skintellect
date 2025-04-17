import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Badge } from 'react-native-paper';
import { useProducts } from '../context/ProductContext';

interface CartButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

const CartButton: React.FC<CartButtonProps> = ({ 
  onPress, 
  color = '#D43F57', 
  size = 24 
}) => {
  const { getTotalCartItems } = useProducts();
  
  const totalItems = getTotalCartItems();
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
    >
      <Feather name="shopping-cart" size={size} color={color} />
      {totalItems > 0 && (
        <Badge style={styles.badge}>
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 5,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#D43F57',
    fontSize: 10,
  },
});

export default CartButton;