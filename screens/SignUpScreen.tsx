import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabaseClient';
import { Button, IconButton } from 'react-native-paper';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigation.navigate<'Onboarding'>('Onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/skincare.png')} style={styles.image} />
      <Text style={styles.title}>Welcome to Skintellect</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <View style={styles.passwordContainer}>
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={secureTextEntry} style={styles.passwordInput} autoCapitalize="none" />
        <IconButton icon={secureTextEntry ? 'eye-off' : 'eye'} onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.icon} />
      </View>
      <Button mode="contained" onPress={handleLogin} style={styles.button}>Login</Button>
      <TouchableOpacity onPress={() => navigation.navigate<'SignUp'>('SignUp')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigation.navigate('Onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join us!</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
      <View style={styles.passwordContainer}>
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={secureTextEntry} style={styles.passwordInput} autoCapitalize="none" />
        <IconButton icon={secureTextEntry ? 'eye-off' : 'eye'} onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.icon} />
      </View>
      <View style={styles.passwordContainer}>
        <TextInput placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={secureConfirmTextEntry} style={styles.passwordInput} autoCapitalize="none" />
        <IconButton icon={secureConfirmTextEntry ? 'eye-off' : 'eye'} onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)} style={styles.icon} />
      </View>
      <Button mode="contained" onPress={handleSignUp} style={styles.button}>Sign Up</Button>
      <TouchableOpacity onPress={() => navigation.navigate<'Login'>('Login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

export { LoginScreen, SignUpScreen };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
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
    width: 150,
    height: 150,
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
    position: 'absolute',
    right: 10,
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

export default SignUpScreen;
