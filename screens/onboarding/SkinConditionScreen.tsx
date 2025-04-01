import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OnboardingLayout from './OnboardingLayout';
import { useOnboarding, SkinCondition } from '../../context/OnboardingContext';

const skinConditionOptions: { label: string; value: SkinCondition; description: string }[] = [
  { 
    label: 'Acne', 
    value: 'acne', 
    description: 'Breakouts, pimples, or blemishes'
  },
  { 
    label: 'Rosacea', 
    value: 'rosacea', 
    description: 'Redness, visible blood vessels, sometimes bumps'
  },
  { 
    label: 'Eczema', 
    value: 'eczema', 
    description: 'Dry, itchy, inflamed patches of skin'
  },
  { 
    label: 'Psoriasis', 
    value: 'psoriasis', 
    description: 'Thick, red patches with silvery scales'
  },
  { 
    label: 'Hyperpigmentation', 
    value: 'hyperpigmentation', 
    description: 'Dark spots or patches, uneven skin tone'
  },
  { 
    label: 'Wrinkles', 
    value: 'wrinkles', 
    description: 'Fine lines and deeper creases'
  },
  { 
    label: 'Blackheads', 
    value: 'blackheads', 
    description: 'Small, dark spots, usually on nose and chin'
  },
  { 
    label: 'Dryness', 
    value: 'dryness', 
    description: 'Flaking, tight-feeling skin'
  },
];

const SkinConditionScreen = () => {
  const navigation = useNavigation();
  const { userProfile, updateSkinConditions } = useOnboarding();
  const [selectedConditions, setSelectedConditions] = useState<SkinCondition[]>(
    userProfile.skinConditions || []
  );

  const handleNext = () => {
    if (selectedConditions.length > 0) {
      updateSkinConditions(selectedConditions);
      navigation.navigate('ConfirmationScreen');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleCondition = (condition: SkinCondition) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter(c => c !== condition));
    } else {
      setSelectedConditions([...selectedConditions, condition]);
    }
  };

  return (
    <OnboardingLayout
      title="What skin conditions do you have?"
      step={4}
      totalSteps={5}
      nextDisabled={selectedConditions.length === 0}
      onNext={handleNext}
      onBack={handleBack}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>
          Select all that apply to you (at least one)
        </Text>

        <ScrollView style={styles.optionsContainer}>
          {skinConditionOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                selectedConditions.includes(option.value) && styles.selectedOption,
              ]}
              onPress={() => toggleCondition(option.value)}
            >
              <View style={styles.optionHeader}>
                <Text
                  style={[
                    styles.optionLabel,
                    selectedConditions.includes(option.value) && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
                <View 
                  style={[
                    styles.checkbox, 
                    selectedConditions.includes(option.value) && styles.checkboxSelected
                  ]}
                >
                  {selectedConditions.includes(option.value) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </View>
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
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '500',
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#D43F57',
    borderColor: '#D43F57',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SkinConditionScreen;