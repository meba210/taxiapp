import EditTaxiModal from '@/components/ui/editTaxiModal';
import BASE_URL from '@/utils/config';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

type taxi = {
  id: number;
  DriversName: string;
  LicenceNo: string;
  PlateNo: string;
  PhoneNo: string;
};

const TaxiDetailPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [taxi, setTaxi] = useState<taxi | null>(null);

  const { id } = useLocalSearchParams<{ id: string }>();

  const fetchtaxisDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      setLoading(true);
      const response = await axios.get(`${BASE_URL}/taxis/taxisDetail/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTaxi(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load taxi details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchtaxisDetails();
  }, [id]);

  const handleRefresh = () => {
    fetchtaxisDetails();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading taxi information...</Text>
      </View>
    );
  }

  if (error || !taxi) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>
          {error || 'No driver data available'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchtaxisDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: isMobile ? 16 : isTablet ? 24 : 32 },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              marginTop: isMobile ? 16 : 24,
              marginBottom: isMobile ? 20 : 30,
            },
          ]}
        >
          <View style={styles.backRow}>
            <TouchableOpacity
              style={[styles.backButton, isMobile && styles.backButtonMobile]}
              onPress={() => router.push('/(tabs)/availableTaxi')}
            >
              <MaterialIcons name="arrow-back" size={20} color="#475569" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.refreshButton}
            >
              <MaterialIcons
                name="refresh"
                size={isMobile ? 20 : 22}
                color="#2196F3"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.titleSection}>
            <View style={styles.titleIconContainer}>
              <MaterialIcons name="directions-car" size={28} color="#2196F3" />
            </View>
            <View style={styles.titleTextContainer}>
              <Text
                style={[
                  styles.headerTitle,
                  { fontSize: isMobile ? 24 : isTablet ? 28 : 32 },
                ]}
              >
                Driver Details
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditModalVisible(true)}
            >
              <MaterialIcons name="edit" size={18} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Edit Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.profileCard,
            {
              padding: isMobile ? 20 : isTablet ? 24 : 32,
              marginBottom: isMobile ? 20 : 30,
            },
          ]}
        >
          <View
            style={[
              styles.profileHeader,
              {
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'center' : 'flex-start',
                marginBottom: isMobile ? 20 : 30,
              },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                {
                  width: isMobile ? 100 : isTablet ? 120 : 140,
                  height: isMobile ? 100 : isTablet ? 120 : 140,
                  borderRadius: isMobile ? 50 : isTablet ? 60 : 70,
                  marginRight: isMobile ? 0 : 20,
                  marginBottom: isMobile ? 16 : 0,
                },
              ]}
            >
              <MaterialIcons
                name="person"
                size={isMobile ? 50 : isTablet ? 60 : 70}
                color="#2196F3"
              />
            </View>

            <View
              style={[
                styles.profileInfo,
                {
                  alignItems: isMobile ? 'center' : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.driverName,
                  {
                    fontSize: isMobile ? 22 : isTablet ? 26 : 30,
                    marginBottom: isMobile ? 8 : 12,
                  },
                ]}
              >
                {taxi?.DriversName ?? 'N/A'}
              </Text>
              <View style={styles.driverIdContainer}>
                <MaterialIcons name="badge" size={16} color="#64748B" />
                <Text style={styles.driverId}>Driver ID: {taxi?.id}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="info" size={24} color="#2196F3" />
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: isMobile ? 18 : 22, marginLeft: 8 },
                ]}
              >
                Contact & Vehicle Information
              </Text>
            </View>

            <View
              style={[
                styles.detailsGrid,
                {
                  flexDirection: isMobile ? 'column' : 'row',
                  flexWrap: isMobile ? 'nowrap' : 'wrap',
                },
              ]}
            >
              <View
                style={[
                  styles.infoRow,
                  {
                    width: isMobile ? '100%' : isTablet ? '48%' : '32%',
                    marginRight: isMobile ? 0 : isTablet ? '4%' : '2%',
                    marginBottom: isMobile ? 15 : 20,
                  },
                ]}
              >
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="person-outline"
                    size={22}
                    color="#2196F3"
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Driver Name</Text>
                  <Text
                    style={[styles.infoValue, { fontSize: isMobile ? 16 : 18 }]}
                  >
                    {taxi?.DriversName ?? 'N/A'}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.infoRow,
                  {
                    width: isMobile ? '100%' : isTablet ? '48%' : '32%',
                    marginRight: isMobile ? 0 : isTablet ? '4%' : '2%',
                    marginBottom: isMobile ? 15 : 20,
                  },
                ]}
              >
                <View style={styles.iconContainer}>
                  <MaterialIcons name="phone" size={22} color="#2196F3" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text
                    style={[styles.infoValue, { fontSize: isMobile ? 16 : 18 }]}
                  >
                    {taxi?.PhoneNo ?? 'N/A'}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.infoRow,
                  {
                    width: isMobile ? '100%' : isTablet ? '48%' : '32%',
                    marginRight: isMobile ? 0 : isTablet ? '4%' : '2%',
                    marginBottom: isMobile ? 15 : 20,
                  },
                ]}
              >
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="folder-special"
                    size={22}
                    color="#2196F3"
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>License Number</Text>
                  <Text
                    style={[styles.infoValue, { fontSize: isMobile ? 16 : 18 }]}
                  >
                    {taxi?.LicenceNo}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.infoRow,
                  {
                    width: isMobile ? '100%' : isTablet ? '48%' : '32%',
                    marginBottom: isMobile ? 15 : 20,
                  },
                ]}
              >
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="directions-car"
                    size={22}
                    color="#2196F3"
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Plate Number</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        fontSize: isMobile ? 16 : 18,
                        letterSpacing: 1,
                      },
                    ]}
                  >
                    {taxi?.PlateNo}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.statusCard, { padding: isMobile ? 20 : 24 }]}>
          <MaterialIcons name="check-circle" size={40} color="#4CAF50" />
          <Text style={[styles.statusTitle, { fontSize: isMobile ? 18 : 20 }]}>
            Active Driver
          </Text>
        </View>

        {/* Edit Modal */}
        <EditTaxiModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          taxi={taxi}
          onTaxiUpdated={(updatedTaxi) => {
            setTaxi(updatedTaxi);
            setIsEditModalVisible(false);
          }}
        />
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
    width: '100%',
  },
  backRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButtonMobile: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  titleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  actionButtons: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileHeader: {
    width: '100%',
  },
  avatarContainer: {
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2196F3',
  },
  profileInfo: {
    width: '100%',
  },
  driverName: {
    fontWeight: 'bold',
    color: '#1E293B',
  },
  driverIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  driverId: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 15,
  },
  detailsSection: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  detailsGrid: {
    width: '100%',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
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
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  infoValue: {
    fontWeight: '600',
    color: '#1E293B',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
    paddingVertical: 24,
  },
  statusTitle: {
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 12,
    marginBottom: 8,
  },
  statusText: {
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
});

export default TaxiDetailPage;
