import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabaseClient';
import { Button } from 'react-native-paper';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} autoCapitalize="none" />
      <TextInput placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={styles.input} autoCapitalize="none" />
      <Button mode="contained" onPress={handleSignUp} style={styles.button}>Sign Up</Button>
      <TouchableOpacity onPress={() => navigation.navigate<'Login'>('Login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
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
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingLeft: 10,
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
