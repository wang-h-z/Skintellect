import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../config/supabaseClient';

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
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update user profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: userProfile.name,
          gender: userProfile.gender,
          skin_type: userProfile.skinType,
          skin_conditions: userProfile.skinConditions,
          has_onboarded: true,
        });
        
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setUserProfile((prev) => ({ ...prev, hasOnboarded: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
      console.error('Onboarding error:', err);
    } finally {
      setIsLoading(false);
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