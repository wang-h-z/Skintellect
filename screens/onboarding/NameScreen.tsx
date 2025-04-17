import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OnboardingLayout from './OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';

const NameScreen = () => {
  const navigation = useNavigation();
  const { userProfile, updateName } = useOnboarding();
  const [name, setName] = useState(userProfile.name);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Validate name
    setIsValid(name.trim().length > 0);
  }, [name]);

  const handleNext = () => {
    if (isValid) {
      // Dismiss keyboard and navigate
      Keyboard.dismiss();
      updateName(name.trim());
      navigation.navigate('GenderScreen');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <OnboardingLayout
        title="What's your name?"
        step={1}
        totalSteps={5}
        nextDisabled={!isValid}
        onNext={handleNext}
        hideBackButton
      >
        <View style={styles.contentContainer}>
          <Text style={styles.subtitle}>
            We'll use this to personalize your experience
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
          />
          {name.trim().length === 0 && (
            <Text style={styles.errorText}>Please enter your name</Text>
          )}
        </View>
      </OnboardingLayout>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#D43F57',
    marginTop: 10,
    fontSize: 14,
  },
});

export default NameScreen;