import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabaseClient';
import { Button, IconButton } from 'react-native-paper';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    // Add keyboard listeners
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        setKeyboardVisible(true);
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: 250,
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
          duration: 250,
          useNativeDriver: false
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        throw error;
      }
      
      // After successful signup, navigate to the first onboarding screen
      // The proper way to do this is to let the app navigator handle the routing
      // based on the authentication state and onboarding status
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'NameScreen' }],
      });
    } catch (error: any) {
      setError(error.message);
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic styling based on keyboard visibility
  const imageSize = keyboardVisible ? 80 : 150;
  const titleMargin = keyboardVisible ? 5 : 10;
  const subtitleMargin = keyboardVisible ? 10 : 30;
  
  // Calculate the content shift based on keyboard height
  const contentShift = keyboardHeight.interpolate({
    inputRange: [0, screenHeight * 0.4],
    outputRange: [0, -screenHeight * 0.15], // Shift content up by a percentage of screen height
    extrapolate: 'clamp'
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View 
            style={[styles.container, { transform: [{ translateY: contentShift }] }]}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Image 
                source={require('../assets/skincare.png')} 
                style={[styles.image, { width: imageSize, height: imageSize }]} 
                resizeMode="contain"
              />
              
              <Text style={[styles.title, { marginBottom: titleMargin }]}>
                Join Skintellect
              </Text>
              
              <Text style={[styles.subtitle, { marginBottom: subtitleMargin }]}>
                Create an account to get personalized skin care recommendations
              </Text>
              
              {error && <Text style={styles.error}>{error}</Text>}
              
              <TextInput 
                placeholder="Email" 
                value={email} 
                onChangeText={setEmail} 
                style={styles.input} 
                autoCapitalize="none" 
                keyboardType="email-address" 
              />
              
              <View style={styles.passwordContainer}>
                <TextInput 
                  placeholder="Password" 
                  value={password} 
                  onChangeText={setPassword} 
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
              
              <View style={styles.passwordContainer}>
                <TextInput 
                  placeholder="Confirm Password" 
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword} 
                  secureTextEntry={secureConfirmTextEntry} 
                  style={styles.passwordInput} 
                  autoCapitalize="none" 
                />
                <IconButton 
                  icon={secureConfirmTextEntry ? 'eye-off' : 'eye'} 
                  onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)} 
                  style={styles.icon} 
                />
              </View>
              
              <Button 
                mode="contained" 
                onPress={() => {
                  Keyboard.dismiss();
                  handleSignUp();
                }} 
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                Sign Up
              </Button>
              
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                style={styles.linkContainer}
              >
                <Text style={styles.link}>Already have an account? Log in</Text>
              </TouchableOpacity>
            </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  image: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D43F57',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  icon: {
    position: 'absolute',
    right: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#D43F57',
    borderRadius: 10,
    paddingVertical: 5,
    marginTop: 5,
  },
  linkContainer: {
    marginTop: 15,
    paddingVertical: 5,
  },
  link: {
    color: '#D43F57',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});

export default SignUpScreen;