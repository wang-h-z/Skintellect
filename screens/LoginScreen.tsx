import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Keyboard,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabaseClient';
import { Button, IconButton } from 'react-native-paper';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Add keyboard listeners
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        setKeyboardVisible(true);
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: 150,
          useNativeDriver: false
        }).start();
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    console.log("Login attempt started");
    
    setError(null);
    try {
      console.log("Calling supabase.auth.signInWithPassword...");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log("Sign in response received");
      
      if (error) {
        console.error("Login error:", error.message);
        setError(error.message);
      } else {
        console.log("Login successful!");
        
        // Check if user has onboarded
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('has_onboarded')
            .eq('id', data.user.id)
            .single();
          
          console.log("Profile data:", profileData);
          
          if (profileData && profileData.has_onboarded) {
            // User has onboarded, go to main app
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          } else {
            // User needs onboarding, go to first onboarding screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'NameScreen' }],
            });
          }
        } catch (profileError) {
          console.error("Error checking profile:", profileError);
          // Default to onboarding if we can't check
          navigation.navigate('NameScreen');
        }
      }
    } catch (e) {
      console.error("Exception during login:", e);
      setError("An unexpected error occurred");
    }
  };

  // Dynamic margins that change when keyboard appears
  const imageMargin = keyboardVisible ? 10 : 20;
  const titleMargin = keyboardVisible ? 10 : 20;
  const imageSize = keyboardVisible ? 100 : 150;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View 
            style={[
              styles.innerContainer,
              { 
                // Move content up by the keyboard height with some extra padding
                transform: [{ 
                  translateY: keyboardHeight.interpolate({
                    inputRange: [0, 500],
                    outputRange: [0, -100], // Adjust this value as needed
                    extrapolate: 'clamp'
                  }) 
                }] 
              }
            ]}
          >
            <Image 
              source={require('../assets/skintellect.png')} 
              style={[
                styles.image, 
                { 
                  width: imageSize, 
                  height: imageSize,
                  marginBottom: imageMargin 
                }
              ]} 
            />
            
            <Text style={[styles.title, { marginBottom: titleMargin }]}>
              Welcome to Skintellect
            </Text>
            
            {error && <Text style={styles.error}>{error}</Text>}
            
            <TextInput 
              placeholder="Email" 
              value={email} 
              onChangeText={(text) => {setEmail(text);}} 
              style={styles.input} 
              autoCapitalize="none" 
              keyboardType="email-address" 
            />
            
            <View style={styles.passwordContainer}>
              <TextInput 
                placeholder="Password" 
                value={password} 
                onChangeText={(text) => {setPassword(text)}} 
                secureTextEntry={secureTextEntry} 
                style={styles.passwordInput} 
                autoCapitalize="none" 
              />
              <IconButton 
                icon={secureTextEntry ? 'eye-off' : 'eye'} 
                onPress={() => setSecureTextEntry(!secureTextEntry)} 
                style={styles.icon} 
              />
            </View>
            
            <Button 
              mode="contained" 
              onPress={() => {
                console.log("Login button pressed");
                handleLogin();
              }} 
              style={styles.button}
            >
              Login
            </Button>
            
            <TouchableOpacity 
              onPress={() => {
                console.log("Navigate to SignUp");
                navigation.navigate('SignUp');
              }}
            >
              <Text style={styles.link}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 15,
  },
  image: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D43F57',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  icon: {
    marginLeft: 'auto',
  },
  button: {
    width: '80%',
    backgroundColor: '#D43F57',
    color: 'white',
    borderRadius: 10,
    paddingVertical: 12,
  },
  link: {
    marginTop: 15,
    color: '#D43F57',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;