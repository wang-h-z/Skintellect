import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { SkinCondition } from '../types/product';
import { useProducts } from '../context/ProductContext';
import { useOnboarding } from '../context/OnboardingContext';

const ScanFaceScreen = () => {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resultsReady, setResultsReady] = useState(false);
  const [skinConditions, setSkinConditions] = useState<SkinCondition[]>([]);
  const [scanCompleted, setScanCompleted] = useState(false);
  const cameraRef = useRef<any>(null);
  
  // Access product context to store scan results
  const { setScanResults, saveScanResults } = useProducts();
  const { userProfile } = useOnboarding();

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photoData = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        setPhoto(photoData.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const retakePicture = () => {
    setPhoto(null);
    setResultsReady(false);
    setSkinConditions([]);
    setScanCompleted(false);
  };

  const analyzePicture = async () => {
    setAnalyzing(true);
    
    try {
      // In a real app, this would call an AI model API
      // For now, simulate analysis with random conditions and some based on user profile
      
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate some realistic conditions based on user profile
      const possibleConditions: SkinCondition[] = [
        'acne', 'dryness', 'redness', 'uneven tone', 
        'fine lines', 'large pores', 'hyperpigmentation', 'dullness'
      ];
      
      // Start with 1-3 random conditions
      const numConditions = Math.floor(Math.random() * 3) + 1;
      const randomConditions: SkinCondition[] = [];
      
      for (let i = 0; i < numConditions; i++) {
        const index = Math.floor(Math.random() * possibleConditions.length);
        if (!randomConditions.includes(possibleConditions[index])) {
          randomConditions.push(possibleConditions[index]);
        }
      }
      
      // If user has a known skin type, add a related condition
      if (userProfile.skinType === 'dry' && !randomConditions.includes('dryness')) {
        randomConditions.push('dryness');
      } else if (userProfile.skinType === 'oily' && !randomConditions.includes('acne')) {
        randomConditions.push('acne');
      } else if (userProfile.skinType === 'sensitive' && !randomConditions.includes('redness')) {
        randomConditions.push('redness');
      }
      
      setSkinConditions(randomConditions);
      setResultsReady(true);
      
      // Store scan results in context
      const scanResults = {
        skinConditions: randomConditions,
        timestamp: new Date()
      };
      setScanResults(scanResults);
      
      // Save scan results to database
      await saveScanResults();
      
    } catch (error) {
      console.error('Error analyzing picture:', error);
      Alert.alert('Error', 'Failed to analyze skin. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const viewRecommendations = () => {
    setScanCompleted(true);
    navigation.navigate('Shop' as never);
  };

  // Flip camera function
  const flipCamera = () => {
    setCameraType(
      cameraType === 'back' ? 'front' : 'back'
    );
  };

  // Handle permission states
  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.centerContainer}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (!permission.granted) {
    // Camera permissions not granted yet
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No access to camera</Text>
        <Text style={styles.instructionText}>
          Camera access is required for skin analysis. Please enable camera permissions in your device settings.
        </Text>
        <Button 
          mode="contained" 
          onPress={requestPermission}
          style={styles.button}
        >
          Request Permission
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => navigation.goBack()}
          style={[styles.button, { marginTop: 10 }]}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Skin Scanner</Text>
      </View>

      <View style={styles.content}>
        {!photo ? (
          <>
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={cameraType}
                onMountError={(error) => {
                  console.error("Camera error:", error);
                  Alert.alert("Camera Error", "Failed to start camera. Please try again.");
                }}
              >
                <View style={styles.cameraOverlay}>
                  <View style={styles.faceGuide} />
                </View>
              </CameraView>
            </View>

            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionText}>
                Position your face within the circle and ensure good lighting
              </Text>
            </View>

            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
                <Feather name="refresh-cw" size={24} color="#D43F57" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              
              <View style={{ width: 50 }} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              
              {analyzing && (
                <View style={styles.analyzingOverlay}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.analyzingText}>Analyzing your skin...</Text>
                </View>
              )}
            </View>

            {resultsReady ? (
              <ScrollView style={styles.scrollableResults} contentContainerStyle={styles.resultsScrollContent}>
                <View style={styles.resultsContainer}>
                  <Text style={styles.resultsTitle}>Skin Analysis Results</Text>
                  
                  {skinConditions.length > 0 ? (
                    <>
                      <Text style={styles.resultsSubtitle}>
                        We've detected the following concerns:
                      </Text>
                      
                      <View style={styles.conditionsList}>
                        {skinConditions.map((condition, index) => (
                          <View key={index} style={styles.conditionItem}>
                            <Feather name="check-circle" size={20} color="#D43F57" />
                            <Text style={styles.conditionText}>{condition.charAt(0).toUpperCase() + condition.slice(1)}</Text>
                          </View>
                        ))}
                      </View>
                      
                      <Text style={styles.analysisDescription}>
                        Based on this analysis, we've curated personalized product recommendations for your skin concerns.
                      </Text>
                      
                      <Button 
                        mode="contained" 
                        onPress={viewRecommendations}
                        style={styles.button}
                      >
                        View Recommended Products
                      </Button>
                    </>
                  ) : (
                    <>
                      <Text style={styles.resultsSubtitle}>
                        No skin concerns detected! Your skin looks healthy.
                      </Text>
                      
                      <Text style={styles.analysisDescription}>
                        We still have some great product recommendations for your skin type.
                      </Text>
                      
                      <Button 
                        mode="contained" 
                        onPress={viewRecommendations}
                        style={styles.button}
                      >
                        View Products
                      </Button>
                    </>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.retakeButton} 
                    onPress={retakePicture}
                  >
                    <Text style={styles.retakeButtonText}>Take Another Photo</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.photoControls}>
                <Button 
                  mode="outlined" 
                  onPress={retakePicture}
                  style={[styles.photoButton, styles.retakePhotoButton]}
                  textColor="#D43F57"
                >
                  Retake
                </Button>
                
                <Button 
                  mode="contained" 
                  onPress={analyzePicture}
                  style={[styles.photoButton, styles.analyzeButton]}
                  disabled={analyzing}
                >
                  Analyze Skin
                </Button>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D43F57',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraContainer: {
    aspectRatio: 1,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 20,
    marginTop: 10,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: '#D43F57',
    borderStyle: 'dashed',
  },
  instructionsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D43F57',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D43F57',
  },
  photoContainer: {
    aspectRatio: 1,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 20,
    marginTop: 10,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  photoButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  retakePhotoButton: {
    borderColor: '#D43F57',
  },
  analyzeButton: {
    backgroundColor: '#D43F57',
  },
  scrollableResults: {
    flex: 1,
  },
  resultsScrollContent: {
    flexGrow: 1,
  },
  resultsContainer: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  conditionsList: {
    marginBottom: 20,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  conditionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  analysisDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#D43F57',
    marginBottom: 10,
  },
  retakeButton: {
    padding: 15,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#D43F57',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D43F57',
    marginBottom: 10,
  },
});

export default ScanFaceScreen;