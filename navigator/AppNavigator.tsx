import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
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

// Main app navigator with tabs
const MainTabsNavigator = () => {
  return (
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

  // Load persisted session and onboarding status
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        // Get persisted session and onboarded status from AsyncStorage
        const [sessionData, onboardedData] = await Promise.all([
          AsyncStorage.getItem(SESSION_KEY),
          AsyncStorage.getItem(ONBOARDED_KEY)
        ]);

        // If we have a persisted session, use it
        if (sessionData) {
          const parsedSession = JSON.parse(sessionData);
          setSession(parsedSession);
          
          // If session is still valid, check onboarded status from Storage or API
          if (parsedSession && parsedSession.user && parsedSession.expires_at > Date.now() / 1000) {
            if (onboardedData === 'true') {
              setHasOnboarded(true);
              setLoading(false);
              return; // Skip the API call if we have cached data
            } else {
              await checkOnboardingStatus(parsedSession.user.id);
            }
          }
        }

        // Get current session from Supabase (handles expired sessions)
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        setSession(supabaseSession);
        
        if (supabaseSession) {
          // Cache the session
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(supabaseSession));
          await checkOnboardingStatus(supabaseSession.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading persisted state:', error);
        setLoading(false);
      }
    };

    loadPersistedState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        console.log("Auth state changed:", event);
        setSession(supabaseSession);
        
        if (supabaseSession) {
          // Cache the new session
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(supabaseSession));
          await checkOnboardingStatus(supabaseSession.user.id);
        } else {
          // Clear cached data on signout
          if (event === 'SIGNED_OUT') {
            await AsyncStorage.removeItem(SESSION_KEY);
            await AsyncStorage.removeItem(ONBOARDED_KEY);
          }
          setHasOnboarded(false);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      console.log("Checking onboarding status for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('has_onboarded')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error checking onboarding status:', error);
        setHasOnboarded(false);
      } else {
        const onboarded = data?.has_onboarded || false;
        setHasOnboarded(onboarded);
        
        // Cache the onboarding status
        await AsyncStorage.setItem(ONBOARDED_KEY, onboarded ? 'true' : 'false');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasOnboarded(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D43F57" />
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
          <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;