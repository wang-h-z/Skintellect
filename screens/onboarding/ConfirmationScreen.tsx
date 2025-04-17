import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OnboardingLayout from './OnboardingLayout';
import { useOnboarding, SkinType, SkinCondition, Gender } from '../../context/OnboardingContext';
import { supabase } from '../../config/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConfirmationScreen = () => {
  const navigation = useNavigation();
  const { userProfile, completeOnboarding, isLoading, error } = useOnboarding();
  const [processingComplete, setProcessingComplete] = useState(false);

  const handleFinish = async () => {
    try {
      // First complete the onboarding process which updates the database
      await completeOnboarding();
      setProcessingComplete(true);
      
      if (!error) {
        // Store onboarding status in AsyncStorage immediately
        await AsyncStorage.setItem('skintellect_onboarded', 'true');
        
        // Force the session to refresh
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Error refreshing session:", refreshError);
          Alert.alert(
            "Error", 
            "There was an issue completing your setup. Please try restarting the app.",
            [{ text: "OK" }]
          );
          return;
        }
        
        // Reset navigation to MainTabs directly
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } catch (err) {
      console.error("Error in handleFinish:", err);
      Alert.alert(
        "Error", 
        "There was an issue completing your setup. Please try again.",
        [{ text: "OK" }]
      );
      setProcessingComplete(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Helper function to get label from value
  const getGenderLabel = (value: Gender): string => {
    switch (value) {
      case 'female': return 'Female';
      case 'male': return 'Male';
      case 'non-binary': return 'Non-binary';
      case 'prefer not to say': return 'Prefer not to say';
      default: return '';
    }
  };

  const getSkinTypeLabel = (value: SkinType): string => {
    switch (value) {
      case 'oily': return 'Oily';
      case 'dry': return 'Dry';
      case 'combination': return 'Combination';
      case 'normal': return 'Normal';
      case 'sensitive': return 'Sensitive';
      default: return '';
    }
  };

  const getSkinConditionLabel = (value: SkinCondition): string => {
    switch (value) {
      case 'acne': return 'Acne';
      case 'rosacea': return 'Rosacea';
      case 'eczema': return 'Eczema';
      case 'psoriasis': return 'Psoriasis';
      case 'hyperpigmentation': return 'Hyperpigmentation';
      case 'wrinkles': return 'Wrinkles';
      case 'blackheads': return 'Blackheads';
      case 'dryness': return 'Dryness';
      default: return '';
    }
  };

  return (
    <OnboardingLayout
      title="Confirm Your Information"
      step={5}
      totalSteps={5}
      nextDisabled={isLoading || processingComplete}
      onNext={handleFinish}
      onBack={handleBack}
      nextButtonText="Finish"
    >
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.subtitle}>
          Please review your profile information
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Name</Text>
          <Text style={styles.infoValue}>{userProfile.name}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Gender</Text>
          <Text style={styles.infoValue}>
            {userProfile.gender ? getGenderLabel(userProfile.gender) : 'Not specified'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Skin Type</Text>
          <Text style={styles.infoValue}>
            {userProfile.skinType ? getSkinTypeLabel(userProfile.skinType) : 'Not specified'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Skin Conditions</Text>
          {userProfile.skinConditions.length > 0 ? (
            userProfile.skinConditions.map((condition) => (
              <Text key={condition} style={styles.conditionItem}>
                • {getSkinConditionLabel(condition)}
              </Text>
            ))
          ) : (
            <Text style={styles.infoValue}>None selected</Text>
          )}
        </View>

        <Text style={styles.disclaimer}>
          You can always update your information later in your profile settings.
        </Text>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D43F57" />
            <Text style={styles.loadingText}>Creating your profile...</Text>
          </View>
        )}
      </ScrollView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D43F57',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  conditionItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  disclaimer: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D43F57',
  },
  errorText: {
    color: '#D43F57',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
});

export default ConfirmationScreen;