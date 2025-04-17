import React, { ReactNode, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  Keyboard, 
  Animated, 
  Platform, 
  Dimensions,
  KeyboardAvoidingView
} from 'react-native';
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
  nextButtonText?: string;
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
  nextButtonText,
}) => {
  const navigation = useNavigation();
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

  // Adaptive UI based on keyboard visibility
  const logoSize = keyboardVisible ? 70 : 100;
  const titleMarginTop = keyboardVisible ? 5 : 10;
  const headerPadding = keyboardVisible ? 10 : 20;
  const headerMarginTop = keyboardVisible ? 5 : 20;
  const progressMarginVertical = keyboardVisible ? 10 : 20;

  // Calculate the content shift when keyboard appears
  const contentShift = keyboardHeight.interpolate({
    inputRange: [0, screenHeight / 2],
    outputRange: [0, -80], // Shift up by amount that works for most screens
    extrapolate: 'clamp'
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View 
          style={[
            styles.mainContainer,
            { transform: [{ translateY: contentShift }] }
          ]}
        >
          <View style={[
            styles.header, 
            { 
              padding: headerPadding, 
              marginTop: headerMarginTop 
            }
          ]}>
            <Image 
              source={require('../../assets/skincare.png')} 
              style={[styles.logo, { width: logoSize, height: logoSize }]} 
              resizeMode="contain" 
            />
            <Text style={[styles.title, { marginTop: titleMarginTop }]}>{title}</Text>
          </View>

          <View style={[styles.progressContainer, { marginVertical: progressMarginVertical }]}>
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
              onPress={() => {
                Keyboard.dismiss();
                onNext();
              }}
              disabled={nextDisabled}
            >
              <Text style={styles.nextButtonText}>
                {nextButtonText || (step === totalSteps ? 'Finish' : 'Next')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  mainContainer: {
    flex: 1,
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