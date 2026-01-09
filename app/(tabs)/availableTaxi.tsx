import { useAddToQueue } from '@/hooks/use-add-to-queue';
import { useAssignedRoute } from '@/hooks/use-assigned-route';
import { useAssignedTaxis } from '@/hooks/use-assigned-taxis';
import { useTaxiByPlate } from '@/hooks/use-taxi-by-plate';
import { useTaxis } from '@/hooks/use-taxis';
import { useQueueStore } from '@/store/queue-store';
import { Taxi } from '@/type';
import BASE_URL from '@/utils/config';
import { formatDateTime } from '@/utils/time-formatter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

export default function AvailableTaxi() {
  const { data: route, isLoading: routeLoading } = useAssignedRoute();
  const { data: assignedTaxis, isLoading: assignedTaxisLoading } =
    useAssignedTaxis(route);
  const { data: taxis, isLoading: taxisLoading } = useTaxis(route);

  const addPlate = useQueueStore((s) => s.addPlate);

  const queuedPlates = useQueueStore((s) => s.queuedPlates);

  const [selectedPlate, setSelectedPlate] = useState<number | undefined>(
    undefined
  );
  const [canSendSMS, setCanSendSMS] = useState<boolean>(false);

  const { data: selectedTaxi } = useTaxiByPlate(selectedPlate);

  const { mutateAsync: addToQueueMutation, isPending } = useAddToQueue();

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useFocusEffect(
    React.useCallback(() => {
      return () => {};
    }, [])
  );

  const addToQueue = async (PlateNo: number) => {
    try {
      await addToQueueMutation({
        PlateNo,
        route,
      });

      addPlate(PlateNo.toString());

      Alert.alert('Success', `Taxi ${PlateNo} added to queue`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        Alert.alert(
          'Taxi Unavailable',
          'This taxi is already in the queue with another station.'
        );
        useQueueStore.getState().removePlate(PlateNo.toString());
      } else {
        Alert.alert('Error', 'Failed to add taxi');
      }
      return;
    }
  };

  useEffect(() => {
    if (!canSendSMS) return;

    const matchedTaxi = assignedTaxis.find(
      (t: any) => t?.PlateNo.toString() === selectedTaxi?.PlateNo.toString()
    );

    if (!matchedTaxi || !selectedPlate) {
      Alert.alert('Error', `No taxi found with plate number ${selectedPlate}`);
      return;
    }

    const formattedTime = formatDateTime(matchedTaxi.time);

    const message = `
      Queue Update

      Plate Number: ${selectedPlate}
      Original Route: ${matchedTaxi.from_route}
      Temporary Route: ${matchedTaxi.to_route}
      Assigned On: ${formattedTime}

      ***IMPORTANT***
      CHECK THE TIME FOR CONFIRMATION.
      This message is valid ONLY for the date and time shown.

      Please proceed to the designated pickup point.
      `.trim();

    sendSMS(selectedTaxi.PhoneNo, message);
    setCanSendSMS(false);
  }, [selectedTaxi, selectedPlate]);

  const sendSMS = async (phone: string, message: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await axios.post(
        `${BASE_URL}/api/send-sms`,
        {
          phone: phone,
          message: message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error: any) {
      console.error('SMS failed:', error.response?.data || error.message);
    }
  };

  if (routeLoading || taxisLoading || assignedTaxisLoading || taxisLoading)
    return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={[styles.backButton, isMobile && styles.backButtonMobile]}
          onPress={() => router.push('/(tabs)/taxiDispacher')}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Taxis List</Text>
          {route && (
            <View style={styles.routeBadge}>
              <Text style={styles.routeText}>Route: {route}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Taxis</Text>
            <Text style={styles.sectionSubtitle}>
              {taxis.length} taxis registered • Updated just now
            </Text>
          </View>

          {taxis.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}></Text>
              <Text style={styles.emptyText}>No taxis available</Text>
              <Text style={styles.emptySubtext}>
                Check back later for available taxis
              </Text>
            </View>
          ) : (
            <View style={[styles.grid, isMobile && styles.gridMobile]}>
              {taxis.map((t: Taxi, index: number) => {
                const isQueued = queuedPlates.includes(t.PlateNo.toString());

                return (
                  <View
                    key={index}
                    style={[styles.taxiCard, isMobile && styles.taxiCardMobile]}
                  >
                    <View style={styles.taxiCardHeader}>
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/(tabs)/taxidetailpage/${t.id}`)
                        }
                        style={styles.plateContainer}
                      >
                        <Text style={styles.plateLabel}>TAXI PLATE</Text>
                        <Text style={styles.plateNumber}>{t.PlateNo}</Text>
                      </TouchableOpacity>
                      <View
                        style={[
                          styles.statusBadge,
                          (isQueued || Boolean(t.isQueued)) &&
                            styles.statusBadgeQueued,
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {isQueued || Boolean(t.isQueued)
                            ? 'In Queue'
                            : 'Available'}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      style={[
                        styles.actionButton,
                        (isQueued || Boolean(t.isQueued)) &&
                          styles.actionButtonDisabled,
                      ]}
                      disabled={isQueued || Boolean(t.isQueued)}
                      onPress={() => {
                        setSelectedPlate(t.PlateNo);
                        addToQueue(t.PlateNo);
                      }}
                    >
                      <Text style={styles.actionButtonText}>
                        {isQueued || t.isQueued
                          ? '✓ Added to Queue'
                          : '+ Add to Queue'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Assigned Taxis Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assigned Taxis</Text>
            <Text style={styles.sectionSubtitle}>
              {assignedTaxis.length} taxis assigned to your route
            </Text>
          </View>

          {assignedTaxis.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}></Text>
              <Text style={styles.emptyText}>No assigned taxis</Text>
              <Text style={styles.emptySubtext}>
                Assign taxis to see them here
              </Text>
            </View>
          ) : (
            <View style={[styles.grid, isMobile && styles.gridMobile]}>
              {assignedTaxis.map((t: any, index: number) => {
                return (
                  <View
                    key={index}
                    style={[styles.taxiCard, isMobile && styles.taxiCardMobile]}
                  >
                    <View style={styles.taxiCardHeader}>
                      <View style={styles.plateContainer}>
                        <Text style={styles.plateLabel}>ASSIGNED TAXI</Text>
                        <Text style={styles.plateNumber}>{t.PlateNo}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,

                          t.is_taxi_used === 1 && styles.statusBadgeQueued,
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {t.is_taxi_used === 1 ? 'In Queue' : 'Available'}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      style={[
                        styles.actionButton,

                        t.is_taxi_used === 1 && styles.actionButtonDisabled,
                      ]}
                      disabled={t.is_taxi_used === 1}
                      onPress={() => {
                        setSelectedPlate(Number(t.PlateNo));
                        setCanSendSMS(true);
                        addToQueue(t.PlateNo);
                      }}
                    >
                      <Text style={styles.actionButtonText}>
                        {t.is_taxi_used === 1
                          ? '✓ Added to Queue'
                          : '+ Add to Queue'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonMobile: {
    top: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  routeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  routeText: {
    color: '#0369A1',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  refreshButtonMobile: {
    top: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  refreshButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  autoRefreshIndicator: {
    backgroundColor: '#E0F2FE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  autoRefreshText: {
    color: '#0369A1',
    fontSize: 14,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridMobile: {
    flexDirection: 'column',
    gap: 12,
  },
  taxiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    minWidth: 300,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  taxiCardMobile: {
    minWidth: '100%',
    maxWidth: '100%',
  },
  taxiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  plateContainer: {
    flex: 1,
  },
  plateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  plateNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 1,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeQueued: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  actionButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
