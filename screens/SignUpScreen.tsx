import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/skincare.png')} style={styles.image} />
      <Text style={styles.title}>Join Skintellect</Text>
      <Text style={styles.subtitle}>Create an account to get personalized skin care recommendations</Text>
      
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
        onPress={handleSignUp} 
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Sign Up
      </Button>
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
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
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
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
    position: 'absolute',
    right: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#D43F57',
    borderRadius: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  link: {
    marginTop: 20,
    color: '#D43F57',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;