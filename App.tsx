// App.tsx
import React from 'react';
import AppNavigator from './navigator/AppNavigator'; // Adjust path as needed
import { OnboardingProvider } from './context/OnboardingContext';
import { ProductProvider } from './context/ProductContext';

export default function App() {
  return (
    <OnboardingProvider>
      <ProductProvider>
        <AppNavigator />
      </ProductProvider>
    </OnboardingProvider>
  );
}