import BASE_URL from '@/utils/config';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

type taxi = {
  id: number;
  DriversName: string;
  LicenceNo: string;
  PlateNo: string;
};

const TaxiDetailPage = () => {

  //const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { width } = useWindowDimensions();
   const isMobile = width < 768;
 
   const [taxi, setTaxi] = useState<taxi| null>(null);

 const { id } = useLocalSearchParams<{ id: string }>();
  // Fetch driver data from API



 const fetchtaxisDetails = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    const response = await axios.get(`${BASE_URL}/taxis/taxisDetail/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Handle response (assuming array or single object)
   // const taxiData = Array.isArray(response.data) ? response.data[0] : response.data;
 console.log("Taxi Detail Page ID:",  response.data);

    setTaxi(response.data);

  } catch (err: any) {
    console.error(err);
    setError(err.response?.data?.message || "Failed to load taxi details");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (!id) return;
      fetchtaxisDetails();
    
     console.log("Current ID from URL:", id);
  }, [id]);

  const handleRefresh = () => {
     fetchtaxisDetails();
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading taxi information...</Text>
      </View>
    );
  }

  // Error state
  if (error || !taxi) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>{error || 'No driver data available'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchtaxisDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
       
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
         
        {/* Header with Refresh Button */}
        <View style={styles.header}>
          <Pressable
                      style={[styles.backButton, isMobile && styles.backButtonMobile]}
                      onPress={() => router.push("/(tabs)/availableTaxi")}
                    >
                      <Text style={styles.backText}>←</Text>
                    </Pressable>
          <View>
           
            <Text style={styles.headerTitle}>Driver Details</Text>
            <Text style={styles.headerSubtitle}>Driver Information</Text>
          </View>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <MaterialIcons name="refresh" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialIcons name="person" size={60} color="#2196F3" />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.driverName}>{taxi?.DriversName ?? 'N/A'}</Text>
             
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Driver Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Driver Information</Text>
             
            {/* Driver Name */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="person" size={24} color="#2196F3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Driver Name</Text>
                <Text style={styles.infoValue}>{taxi?.DriversName ?? 'N/A'}</Text>
              </View>
            </View>
            
            {/* License Number */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="badge" size={24} color="#2196F3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>License Number</Text>
                <Text style={styles.infoValue}>{taxi?.LicenceNo}</Text>
              </View>
            </View>
            
            {/* Plate Number */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="directions-car" size={24} color="#2196F3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Plate Number</Text>
                <Text style={styles.infoValue}>{taxi?.PlateNo}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status Card */}
       
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#2196F3',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
   backButtonMobile: {
    top: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
    backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 10,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 5,
     textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
     textAlign: "center",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#2196F3',
  },
  profileInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  driverId: {
    fontSize: 14,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 15,
  },
  detailsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 10,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default TaxiDetailPage ;


