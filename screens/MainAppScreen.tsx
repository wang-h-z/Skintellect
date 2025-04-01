.import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabaseClient';
import { Button } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

interface UserProfile {
  id: string;
  name: string;
  gender: string;
  skin_type: string;
  skin_conditions: string[];
  has_onboarded: boolean;
}

const MainAppScreen = () => {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setUserProfile(data);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanFace = () => {
    // Navigate to face scanning screen (to be implemented)
    navigation.navigate('ScanFace');
  };

  const handleChat = () => {
    // Navigate to chat screen (to be implemented)
    navigation.navigate('DermaChat');
  };

  const handleShop = () => {
    // Navigate to shop screen (to be implemented)
    navigation.navigate('Shop');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Skintellect</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Feather name="user" size={24} color="#D43F57" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {userProfile?.name || 'User'}!
          </Text>
          <Text style={styles.subtitleText}>
            How can we help with your skin today?
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <TouchableOpacity style={styles.featureCard} onPress={handleScanFace}>
            <View style={styles.featureIconContainer}>
              <Feather name="camera" size={32} color="#D43F57" />
            </View>
            <Text style={styles.featureTitle}>Scan Face</Text>
            <Text style={styles.featureDescription}>
              Analyze your skin condition with our AI-powered scanner
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={handleChat}>
            <View style={styles.featureIconContainer}>
              <Feather name="message-circle" size={32} color="#D43F57" />
            </View>
            <Text style={styles.featureTitle}>Derma Chat</Text>
            <Text style={styles.featureDescription}>
              Get personalized skincare advice from our AI dermatologist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard} onPress={handleShop}>
            <View style={styles.featureIconContainer}>
              <Feather name="shopping-bag" size={32} color="#D43F57" />
            </View>
            <Text style={styles.featureTitle}>Shop</Text>
            <Text style={styles.featureDescription}>
              Discover products personalized for your skin needs
            </Text>
          </TouchableOpacity>
        </View>

        {userProfile?.skin_type && (
          <View style={styles.skinInfoContainer}>
            <Text style={styles.skinInfoTitle}>Your Skin Profile</Text>
            <View style={styles.skinInfoCard}>
              <Text style={styles.skinInfoLabel}>Skin Type:</Text>
              <Text style={styles.skinInfoValue}>{userProfile.skin_type}</Text>
            </View>
            
            {userProfile.skin_conditions && userProfile.skin_conditions.length > 0 && (
              <View style={styles.skinInfoCard}>
                <Text style={styles.skinInfoLabel}>Skin Conditions:</Text>
                <View>
                  {userProfile.skin_conditions.map((condition, index) => (
                    <Text key={index} style={styles.skinInfoValue}>
                      • {condition}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <Button 
          mode="outlined" 
          style={styles.signOutButton}
          textColor="#D43F57"
          onPress={handleSignOut}
        >
          Sign Out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FFCDD2',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D43F57',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
  },
  featuresContainer: {
    marginBottom: 25,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  skinInfoContainer: {
    marginBottom: 25,
  },
  skinInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  skinInfoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  skinInfoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D43F57',
    marginBottom: 5,
  },
  skinInfoValue: {
    fontSize: 16,
    color: '#333',
  },
  signOutButton: {
    marginTop: 10,
    marginBottom: 30,
    borderColor: '#D43F57',
  },
});

export default MainAppScreen;