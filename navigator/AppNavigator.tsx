import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../config/supabaseClient';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

// Onboarding screens
import NameScreen from '../screens/onboarding/NameScreen';
import GenderScreen from '../screens/onboarding/GenderScreen';
import SkinTypeScreen from '../screens/onboarding/SkinTypeScreen';
import SkinConditionScreen from '../screens/onboarding/SkinConditionScreen';
import ConfirmationScreen from '../screens/onboarding/ConfirmationScreen';

// Main app screens
import ScanFaceScreen from '../screens/ScanFaceScreen';
import ShopScreen from '../screens/ShopScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Providers
import { OnboardingProvider } from '../context/OnboardingContext';
import { ProductProvider } from '../context/ProductContext';

// Define basic navigator param lists
type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

type OnboardingStackParamList = {
  NameScreen: undefined;
  GenderScreen: undefined;
  SkinTypeScreen: undefined;
  SkinConditionScreen: undefined;
  ConfirmationScreen: undefined;
};

type MainTabsParamList = {
  Scan: undefined;
  Shop: undefined;
  Self: undefined;
};

// Create navigators
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabsParamList>();

// Auth navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
};

// Onboarding navigator
const OnboardingNavigator = () => {
  return (
    <OnboardingProvider>
      <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
        <OnboardingStack.Screen name="NameScreen" component={NameScreen} />
        <OnboardingStack.Screen name="GenderScreen" component={GenderScreen} />
        <OnboardingStack.Screen name="SkinTypeScreen" component={SkinTypeScreen} />
        <OnboardingStack.Screen name="SkinConditionScreen" component={SkinConditionScreen} />
        <OnboardingStack.Screen name="ConfirmationScreen" component={ConfirmationScreen} />
      </OnboardingStack.Navigator>
    </OnboardingProvider>
  );
};

// Main app tabs with product provider
const MainTabsWithProvider = () => {
  return (
    <ProductProvider>
      <MainTabs.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#D43F57',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            backgroundColor: '#FFF5F5',
            borderTopColor: '#FFCDD2',
            paddingBottom: 5,
            paddingTop: 5,
          },
        }}
      >
        <MainTabs.Screen
          name="Scan"
          component={ScanFaceScreen}
          options={{
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Feather name="camera" size={size} color={color} />
            ),
          }}
        />
        <MainTabs.Screen
          name="Shop"
          component={ShopScreen}
          options={{
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Feather name="shopping-bag" size={size} color={color} />
            ),
          }}
        />
        <MainTabs.Screen
          name="Self"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Feather name="user" size={size} color={color} />
            ),
          }}
        />
      </MainTabs.Navigator>
    </ProductProvider>
  );
};

// Constants for storage keys
const SESSION_KEY = 'skintellect_session';
const ONBOARDED_KEY = 'skintellect_onboarded';

// Root app navigator
const AppNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted session and onboarding status
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        // Set a timeout to prevent indefinite loading
        const timeoutId = setTimeout(() => {
          if (loading) {
            console.log("⚠️ Loading timeout reached");
            setLoading(false);
            setError("Loading timed out. Please restart the app.");
          }
        }, 20000);

        console.log("📱 App startup: Loading persisted state...");

        // Get persisted session and onboarded status from AsyncStorage
        const [sessionData, onboardedData] = await Promise.all([
          AsyncStorage.getItem(SESSION_KEY),
          AsyncStorage.getItem(ONBOARDED_KEY)
        ]);

        console.log("📱 Persisted data loaded:", { 
          hasSessionData: !!sessionData, 
          onboardedData 
        });

        // Get current session from Supabase
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        console.log("📱 Current session:", { hasSession: !!supabaseSession });
        
        // Set the session state
        setSession(supabaseSession);
        
        if (supabaseSession) {
          // Cache the session
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(supabaseSession));
          
          // Check if onboarded status is in AsyncStorage
          if (onboardedData === 'true') {
            console.log("📱 User is onboarded according to AsyncStorage");
            setHasOnboarded(true);
          } else {
            // If not in AsyncStorage, check from database
            await checkOnboardingStatus(supabaseSession.user.id);
          }
        } else {
          // No active session
          console.log("📱 No active session");
          setHasOnboarded(false);
        }
        
        setLoading(false);
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('❌ Error loading persisted state:', error);
        setLoading(false);
        setError("Failed to load app state. Please try again.");
      }
    };

    loadPersistedState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        console.log("📱 Auth state changed:", event);
        
        // Update session state
        setSession(supabaseSession);
        
        if (supabaseSession) {
          // Cache the new session
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(supabaseSession));
          
          // For sign-ins, we need to check onboarding status
          if (event === 'SIGNED_IN') {
            console.log("📱 User signed in, checking onboarding status");
            
            // First check AsyncStorage
            const onboardedData = await AsyncStorage.getItem(ONBOARDED_KEY);
            
            if (onboardedData === 'true') {
              console.log("📱 User is onboarded according to AsyncStorage");
              setHasOnboarded(true);
            } else {
              // If not in AsyncStorage, check the database
              await checkOnboardingStatus(supabaseSession.user.id);
            }
          }
        } else {
          // Clear cached data on signout
          if (event === 'SIGNED_OUT') {
            console.log("📱 User signed out, clearing cached data");
            await AsyncStorage.removeItem(SESSION_KEY);
            await AsyncStorage.removeItem(ONBOARDED_KEY);
            setHasOnboarded(false);
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      console.log("📱 Checking onboarding status for user:", userId);
      
      // Check if a profile exists in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('has_onboarded')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('❌ Error checking onboarding status:', error);
        
        // Only create a default profile if we get a "not found" error
        if (error.code === 'PGRST116') {
          console.log("📱 No profile found, creating default profile");
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              has_onboarded: false,
            });
            
          if (insertError) {
            console.error('❌ Error creating profile:', insertError);
          }
          
          setHasOnboarded(false);
          await AsyncStorage.setItem(ONBOARDED_KEY, 'false');
        } else {
          // For other errors, assume not onboarded to be safe
          setHasOnboarded(false);
          await AsyncStorage.setItem(ONBOARDED_KEY, 'false');
        }
      } else if (data) {
        // Profile exists, use its onboarding status
        console.log("📱 Profile found, has_onboarded =", data.has_onboarded);
        
        const onboarded = !!data.has_onboarded;
        setHasOnboarded(onboarded);
        await AsyncStorage.setItem(ONBOARDED_KEY, onboarded ? 'true' : 'false');
      } else {
        // No data returned but also no error
        console.log("📱 No profile data returned, setting has_onboarded to false");
        setHasOnboarded(false);
        await AsyncStorage.setItem(ONBOARDED_KEY, 'false');
      }
    } catch (error) {
      console.error('❌ Unexpected error in checkOnboardingStatus:', error);
      setHasOnboarded(false);
      await AsyncStorage.setItem(ONBOARDED_KEY, 'false');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F5' }}>
        <ActivityIndicator size="large" color="#D43F57" />
        <Text style={{ marginTop: 20, color: '#666' }}>Loading your profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 20 }}>
        <Feather name="alert-circle" size={50} color="#D43F57" />
        <Text style={{ marginTop: 20, fontSize: 18, color: '#333', textAlign: 'center' }}>{error}</Text>
        <Text style={{ marginTop: 10, color: '#666', textAlign: 'center' }}>
          Please check your connection and restart the app.
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : !hasOnboarded ? (
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <RootStack.Screen name="MainTabs" component={MainTabsWithProvider} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;