import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OnboardingLayout from './OnboardingLayout';
import { useOnboarding, Gender } from '../../context/OnboardingContext';

const genderOptions: { label: string; value: Gender }[] = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Non-binary', value: 'non-binary' },
  { label: 'Prefer not to say', value: 'prefer not to say' },
];

const GenderScreen = () => {
  const navigation = useNavigation();
  const { userProfile, updateGender } = useOnboarding();
  const [selectedGender, setSelectedGender] = useState<Gender | null>(userProfile.gender);

  const handleNext = () => {
    if (selectedGender) {
      updateGender(selectedGender);
      navigation.navigate('SkinTypeScreen');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectGender = (gender: Gender) => {
    setSelectedGender(gender);
  };

  return (
    <OnboardingLayout
      title="What's your gender?"
      step={2}
      totalSteps={5}
      nextDisabled={!selectedGender}
      onNext={handleNext}
      onBack={handleBack}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>
          This helps us personalize our recommendations
        </Text>

        <ScrollView style={styles.optionsContainer}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                selectedGender === option.value && styles.selectedOption,
              ]}
              onPress={() => handleSelectGender(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedGender === option.value && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
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
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
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
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#D43F57',
  },
});

export default GenderScreen;