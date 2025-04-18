import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../config/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Define types for skin conditions and skin types
export type SkinType = 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';
export type SkinCondition = 'acne' | 'rosacea' | 'eczema' | 'psoriasis' | 'hyperpigmentation' | 'wrinkles' | 'blackheads' | 'dryness';
export type Gender = 'male' | 'female' | 'non-binary' | 'prefer not to say';

// User profile type
export interface UserProfile {
  id?: string;
  name: string;
  gender: Gender | null;
  skinType: SkinType | null;
  skinConditions: SkinCondition[];
  hasOnboarded: boolean;
}

// Context type
interface OnboardingContextType {
  userProfile: UserProfile;
  updateName: (name: string) => void;
  updateGender: (gender: Gender) => void;
  updateSkinType: (skinType: SkinType) => void;
  updateSkinConditions: (skinConditions: SkinCondition[]) => void;
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Default user profile
const defaultUserProfile: UserProfile = {
  name: '',
  gender: null,
  skinType: null,
  skinConditions: [],
  hasOnboarded: false,
};

// Create context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Provider component
export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  const logDebug = (message: string) => {
    console.log(`[Onboarding] ${message}`);
  };

  // Update name
  const updateName = (name: string) => {
    setUserProfile((prev) => ({ ...prev, name }));
  };

  // Update gender
  const updateGender = (gender: Gender) => {
    setUserProfile((prev) => ({ ...prev, gender }));
  };

  // Update skin type
  const updateSkinType = (skinType: SkinType) => {
    setUserProfile((prev) => ({ ...prev, skinType }));
  };

  // Update skin conditions
  const updateSkinConditions = (skinConditions: SkinCondition[]) => {
    setUserProfile((prev) => ({ ...prev, skinConditions }));
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      logDebug("Starting completeOnboarding...");
      
      // Validate required fields
      if (!userProfile.name || userProfile.name.trim() === '') {
        throw new Error('Name is required to complete onboarding');
      }
      
      // Get current user ID
      logDebug("Getting current user...");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Error getting user: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      logDebug(`User ID: ${user.id}`);
      
      // First, make a local copy of the profile data to ensure it's not changed during the operation
      const profileData = {
        id: user.id,
        name: userProfile.name,
        gender: userProfile.gender,
        skin_type: userProfile.skinType,
        skin_conditions: userProfile.skinConditions,
        has_onboarded: true
      };
      
      // Log the exact data being sent
      logDebug(`Profile data being sent: ${JSON.stringify(profileData)}`);
      
      // Update user profile in database - using insert with onConflict
      logDebug("Upserting profile...");
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(profileData);
        
      if (updateError) {
        logDebug(`Upsert error: ${JSON.stringify(updateError)}`);
        throw new Error(`Error updating profile: ${updateError.message}`);
      }
      
      logDebug("Profile updated successfully");
      
      // Verify the profile was created correctly by fetching it
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (verifyError) {
        logDebug(`Verification error: ${verifyError.message}`);
      } else {
        logDebug(`Verified profile: ${JSON.stringify(verifyData)}`);
      }
      
      // Update local state
      setUserProfile((prev) => ({ ...prev, id: user.id, hasOnboarded: true }));
      
      // Update AsyncStorage immediately
      logDebug("Updating AsyncStorage...");
      await AsyncStorage.setItem('skintellect_onboarded', 'true');
      
      logDebug("Onboarding completed successfully");
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding';
      logDebug(`Error in completeOnboarding: ${errorMessage}`);
      setError(errorMessage);
      
      // Alert for easier debugging
      if (__DEV__) {
        Alert.alert(
          "Onboarding Error",
          errorMessage,
          [{ text: "OK" }]
        );
      }
      
      throw err; // Re-throw so the confirmation screen knows there was an error
    } finally {
      setIsLoading(false);
      logDebug("Finished completeOnboarding (isLoading set to false)");
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        userProfile,
        updateName,
        updateGender,
        updateSkinType,
        updateSkinConditions,
        completeOnboarding,
        isLoading,
        error,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook for using the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};