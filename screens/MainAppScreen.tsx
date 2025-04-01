import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MainAppScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Redirect to the tabs navigation
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  }, [navigation]);

  // This screen should only appear momentarily before redirecting
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
  },
  text: {
    fontSize: 18,
    color: '#D43F57',
  },
});

export default MainAppScreen;