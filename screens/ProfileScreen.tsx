import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../config/supabaseClient';
import { SkinType, SkinCondition, Gender } from '../context/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  id: string;
  name: string;
  gender: Gender;
  skin_type: SkinType;
  skin_conditions: SkinCondition[];
  email: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User from auth:', user);
      
      if (!user) {
        throw new Error('Not authenticated');
      }
  
      // Get user profile
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
  
      if (supabaseError) {
        throw supabaseError;
      }
  
      // Set default for skin_conditions if it's null/undefined
      setProfile({
        ...data,
        email: user.email || '',
        skin_conditions: data.skin_conditions || [],
      });
      
      // Log data instead of profile state
      console.log("Fetched profile data:", data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };  
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D43F57" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button 
          mode="contained" 
          onPress={fetchProfile}
          style={{ marginTop: 20 }}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarLetter}>
              {profile?.name ? profile.name[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{profile?.name || 'Not set'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{profile?.gender || 'Not set'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Skin Profile</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Skin Type</Text>
              <Text style={styles.infoValue}>{profile?.skin_type || 'Not set'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Skin Conditions</Text>
              <View>
                {profile?.skin_conditions && profile.skin_conditions.length > 0 ? (
                  profile.skin_conditions.map((condition, index) => (
                    <Text key={index} style={styles.infoValue}>
                      • {condition}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.infoValue}>None selected</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Activity</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Feather name="camera" size={24} color="#D43F57" />
              <Text style={styles.statCount}>0</Text>
              <Text style={styles.statLabel}>Scans</Text>
            </View>
            
            <View style={styles.statItem}>
              <Feather name="shopping-bag" size={24} color="#D43F57" />
              <Text style={styles.statCount}>0</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            
            <View style={styles.statItem}>
              <Feather name="heart" size={24} color="#D43F57" />
              <Text style={styles.statCount}>0</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => console.log('Edit profile')}
        >
          <Feather name="edit-2" size={20} color="#D43F57" />
          <Text style={styles.menuItemText}>Edit Profile</Text>
          <Feather name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => console.log('Settings')}
        >
          <Feather name="settings" size={20} color="#D43F57" />
          <Text style={styles.menuItemText}>Settings</Text>
          <Feather name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => console.log('Help')}
        >
          <Feather name="help-circle" size={20} color="#D43F57" />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Feather name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => console.log('Privacy')}
        >
          <Feather name="lock" size={20} color="#D43F57" />
          <Text style={styles.menuItemText}>Privacy & Data</Text>
          <Feather name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>

        <Button 
          mode="outlined" 
          style={styles.signOutButton}
          textColor="#D43F57"
          onPress={handleSignOut}
        >
          Sign Out
        </Button>
        
        <Text style={styles.versionText}>Skintellect v1.0.0</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#D43F57',
    textAlign: 'center',
    marginBottom: 10,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FFCDD2',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D43F57',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D43F57',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  infoRow: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D43F57',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  statsSection: {
    marginBottom: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  signOutButton: {
    marginTop: 10,
    marginBottom: 20,
    borderColor: '#D43F57',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 20,
    fontSize: 12,
  },
});

export default ProfileScreen;