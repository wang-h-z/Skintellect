import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  step: number;
  totalSteps: number;
  nextDisabled?: boolean;
  onNext: () => void;
  onBack?: () => void;
  hideBackButton?: boolean;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  step,
  totalSteps,
  nextDisabled = false,
  onNext,
  onBack,
  hideBackButton = false,
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/skincare.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index < step ? styles.progressDotActive : {},
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>{children}</View>

      <View style={styles.buttonContainer}>
        {!hideBackButton && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            hideBackButton ? styles.fullWidthButton : {},
            nextDisabled ? styles.disabledButton : {}
          ]}
          onPress={onNext}
          disabled={nextDisabled}
        >
          <Text style={styles.nextButtonText}>
            {step === totalSteps ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D43F57',
    marginTop: 10,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFCDD2',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#D43F57',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    padding: 15,
    width: '45%',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D43F57',
  },
  backButtonText: {
    color: '#D43F57',
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#D43F57',
    padding: 15,
    width: '45%',
    alignItems: 'center',
    borderRadius: 10,
  },
  fullWidthButton: {
    width: '100%',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#FFCDD2',
    opacity: 0.7,
  },
});

export default OnboardingLayout;