import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OnboardingLayout from './OnboardingLayout';
import { useOnboarding, SkinType } from '../../context/OnboardingContext';

const skinTypeOptions: { label: string; value: SkinType; description: string }[] = [
  { 
    label: 'Oily', 
    value: 'oily', 
    description: 'Shiny appearance, especially in T-zone; prone to acne and enlarged pores'
  },
  { 
    label: 'Dry', 
    value: 'dry', 
    description: 'Feels tight, flaky patches; can be easily irritated and prone to fine lines'
  },
  { 
    label: 'Combination', 
    value: 'combination', 
    description: 'Oily in some areas (usually T-zone) and dry in others (usually cheeks)'
  },
  { 
    label: 'Normal', 
    value: 'normal', 
    description: 'Neither too oily nor too dry; balanced and generally problem-free'
  },
  { 
    label: 'Sensitive', 
    value: 'sensitive', 
    description: 'Easily irritated by products, weather, or stress; may experience redness'
  },
];

const SkinTypeScreen = () => {
  const navigation = useNavigation();
  const { userProfile, updateSkinType } = useOnboarding();
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType | null>(
    userProfile.skinType
  );

  const handleNext = () => {
    if (selectedSkinType) {
      updateSkinType(selectedSkinType);
      navigation.navigate('SkinConditionScreen');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectSkinType = (skinType: SkinType) => {
    setSelectedSkinType(skinType);
  };

  return (
    <OnboardingLayout
      title="What's your skin type?"
      step={3}
      totalSteps={5}
      nextDisabled={!selectedSkinType}
      onNext={handleNext}
      onBack={handleBack}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>
          Select the option that best describes your skin
        </Text>

        <ScrollView style={styles.optionsContainer}>
          {skinTypeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                selectedSkinType === option.value && styles.selectedOption,
              ]}
              onPress={() => handleSelectSkinType(option.value)}
            >
              <Text
                style={[
                  styles.optionLabel,
                  selectedSkinType === option.value && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  selectedOption: {
    backgroundColor: '#FFE4E6',
    borderColor: '#D43F57',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#D43F57',
  },
});

export default SkinTypeScreen;