import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../config/supabaseClient';

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
          tabBarIcon: ({ color, size }) => (
            <Feather name="camera" size={size} color={color} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-bag" size={size} color={color} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Self"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </MainTabs.Navigator>
  );
};

// Root app navigator
const AppNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    // Check if user is signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkOnboardingStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await checkOnboardingStatus(session.user.id);
        } else {
          setHasOnboarded(false);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkOnboardingStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('has_onboarded')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error checking onboarding status:', error);
        setHasOnboarded(false);
      } else {
        setHasOnboarded(data?.has_onboarded || false);
      }
    } catch (error) {
      console.error('Error:', error);
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