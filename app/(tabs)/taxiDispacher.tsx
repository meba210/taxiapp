import NotificationBell from '@/components/ui/NotificationBell';
import TaxiRegistration from '@/components/ui/taxiRegistrationModal';
import { useAssignedRoute } from '@/hooks/use-assigned-route';
import { useAvailableTaxis } from '@/hooks/use-available.taxis';
import { useCurrentPassengers } from '@/hooks/use-current-passengers';
import { usePassengerQueue } from '@/hooks/use-passenger-queue';
import { useRemoveTaxi } from '@/hooks/use-remove-taxi';
import { useTaxiQueue } from '@/hooks/use-taxi-queue';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

export default function TaxiDispatcher() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isLargeScreen = width >= 1024;
  const isExtraLargeScreen = width >= 1200;

  const containerWidth = isExtraLargeScreen
    ? '80%'
    : isLargeScreen
      ? '85%'
      : isTablet
        ? '90%'
        : '95%';
  const iconSize = {
    small: isMobile ? 16 : isTablet ? 18 : 20,
    medium: isMobile ? 20 : isTablet ? 22 : 24,
    large: isMobile ? 24 : isTablet ? 28 : 32,
    xlarge: isMobile ? 28 : isTablet ? 32 : 40,
  };
  const fontSize = {
    xs: isMobile ? 10 : isTablet ? 11 : 12,
    sm: isMobile ? 12 : isTablet ? 14 : 16,
    md: isMobile ? 14 : isTablet ? 16 : 18,
    lg: isMobile ? 16 : isTablet ? 18 : 20,
    xl: isMobile ? 18 : isTablet ? 20 : 22,
    '2xl': isMobile ? 20 : isTablet ? 24 : 28,
    '3xl': isMobile ? 24 : isTablet ? 28 : 32,
  };

  /** API call */
  const { data: assignedRoutes, isLoading, error } = useAssignedRoute();
  const {
    data: currentPassengers,
    isLoading: isCurrentPassengerLoading,
    error: isCurrrentPassengerError,
  } = useCurrentPassengers();
  const {
    data: availabletaxis,
    isLoading: isAvailableTaxLoading,
    error: isAvailableTaxisError,
  } = useAvailableTaxis(assignedRoutes);
  const {
    data: taxiData,
    isLoading: isTaxiDataLoading,
    error: isTaxiDataError,
  } = useTaxiQueue(assignedRoutes);

  const { mutate: removeTaxi } = useRemoveTaxi();
  const { mutateAsync: submitPassenger, isPending } = usePassengerQueue();

  const [showModal, setShowModal] = useState(false);
  const [WaitingCount, setWaitingCount] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const stationId = 78;

  const queryClient = useQueryClient();

  const routeRef = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (assignedRoutes) {
      routeRef.current = assignedRoutes;
    }
  }, [assignedRoutes]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();

      setToken(null);

      // useQueueStore.getState().reset();
      // queryClient.clear();

      router.replace('/(tabs)/profile');
    } catch (err) {
      console.error('Failed to logout:', err);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleNotifications = async () => {
    Alert.alert(
      'Notifications',
      `You have ${notificationCount} new notifications`
    );
  };

  const handlePassengerSubmit = async () => {
    const count = Number(WaitingCount);

    if (!Number.isInteger(count) || count < 0) {
      Alert.alert('Error', 'Passenger count must be a valid number');
      return;
    }

    try {
      setIsUpdating(true);

      const res = await submitPassenger(count);

      Alert.alert(
        'Success',
        res.action === 'updated'
          ? 'Passenger count updated!'
          : 'Passenger count added!'
      );

      setWaitingCount('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit passenger count');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setToken(token);
      console.log('Token from AsyncStorage:', token);
    };

    loadToken();
  }, []);

  // useEffect(() => {
  //   console.log('At least I am here .................');

  //   const handleConnect = () => console.log(' Socket connected', socket.id);
  //   const handleDisconnect = (reason: string) =>
  //     console.log(' Socket disconnected', reason);

  //   socket.on('connect', handleConnect);
  //   socket.on('disconnect', handleDisconnect);

  //   const initSocket = async () => {
  //     const token = await AsyncStorage.getItem('token');

  //     if (!token) return;

  //     socket.auth = { token }; // must be before connect
  //     if (!socket.connected) socket.connect();
  //   };

  //   initSocket();

  //   return () => {
  //     socket.off('connect', handleConnect);
  //     socket.off('disconnect', handleDisconnect);
  //   };
  // }, []);

  // useEffect(() => {
  //   if (!assignedRoutes) return;

  //   console.log('Setting up socket for route:', assignedRoutes);

  //   // Connect if not already connected
  //   if (!socket.connected) socket.connect();

  //   // Join route room on connect
  //   const handleConnect = () => {
  //     console.log(' Socket connected:', socket.id);
  //     socket.emit('joinRoute', assignedRoutes);
  //   };
  //   socket.on('connect', handleConnect);

  //   // Listen for taxi assigned events
  //   const handleTaxiAssigned = (data: any) => {
  //     console.log(' Taxi assigned event received:', data);

  //     // Only invalidate if the update is for this route
  //     if (data.from_route === assignedRoutes) {
  //       queryClient.invalidateQueries({
  //         queryKey: ['taxiQueue'],
  //         exact: false,
  //       });
  //       queryClient.invalidateQueries({
  //         queryKey: ['availableTaxis'],
  //         exact: false,
  //       });
  //       queryClient.invalidateQueries({
  //         queryKey: ['assignedRoute'],
  //         exact: false,
  //       });
  //     }
  //   };
  //   socket.on('taxi:assigned', handleTaxiAssigned);

  //   return () => {
  //     socket.off('connect', handleConnect);
  //     socket.off('taxi:assigned', handleTaxiAssigned);
  //     // Keep socket alive globally
  //   };
  // }, [assignedRoutes]);

  // useEffect(() => {
  //   const initSocket = async () => {
  //     // const token = await AsyncStorage.getItem('token');
  //     if (!token || !assignedRoutes) return;

  //     // Set auth before connecting
  //     socket.auth = { token };

  //     if (!socket.connected) {
  //       socket.connect();
  //     }

  //     // Connect callback
  //     const handleConnect = () => {
  //       console.log(' Socket connected', socket.id);
  //       socket.emit('joinRoute', assignedRoutes);
  //     };

  //     // Event listeners
  //     const handleDisconnect = (reason: string) =>
  //       console.log(' Socket disconnected', reason);

  //     const handleTaxiAssigned = (data: any) => {
  //       console.log(' Taxi assigned event received:', data);

  //       if (data.from_route === assignedRoutes) {
  //         queryClient.invalidateQueries({
  //           queryKey: ['taxiQueue'],
  //           exact: false,
  //         });
  //         queryClient.invalidateQueries({
  //           queryKey: ['availableTaxis'],
  //           exact: false,
  //         });
  //         queryClient.invalidateQueries({
  //           queryKey: ['assignedRoute'],
  //           exact: false,
  //         });
  //       }
  //     };

  //     socket.on('connect', handleConnect);
  //     socket.on('disconnect', handleDisconnect);
  //     socket.on('taxi:assigned', handleTaxiAssigned);

  //     // Cleanup
  //     return () => {
  //       socket.off('connect', handleConnect);
  //       socket.off('disconnect', handleDisconnect);
  //       socket.off('taxi:assigned', handleTaxiAssigned);
  //     };
  //   };

  //   initSocket();
  // }, [assignedRoutes, queryClient]);

  if (
    (isLoading && !assignedRoutes) ||
    (isCurrentPassengerLoading && !currentPassengers) ||
    (isAvailableTaxLoading && !availabletaxis) ||
    (isTaxiDataLoading && !taxiData)
  )
    return <ActivityIndicator />;

  if (
    error ||
    isCurrrentPassengerError ||
    isAvailableTaxisError ||
    isTaxiDataError
  )
    return <Text>Something went wrong</Text>;

  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View
        style={[
          styles.headerContainer,
          {
            paddingVertical: isMobile ? 25 : isTablet ? 30 : 35,
          },
        ]}
      >
        <View
          style={[
            styles.headerTopRow,
            {
              paddingHorizontal: isMobile ? 15 : isTablet ? 20 : 25,
              marginBottom: isMobile ? 15 : 20,
            },
          ]}
        >
          <View style={[styles.headerRightSection, { gap: isMobile ? 8 : 12 }]}>
            <Pressable
              style={styles.notificationButton}
              onPress={handleNotifications}
            >
              <NotificationBell stationId={stationId} />

              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Feather name="log-out" size={iconSize.small} color="#FFFFFF" />
              {!isMobile && <Text style={styles.logoutText}>Logout</Text>}
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.headerContent,
            { paddingHorizontal: isMobile ? 15 : isTablet ? 20 : 25 },
          ]}
        >
          <View
            style={[
              styles.headerIconContainer,
              {
                width: isMobile ? 60 : isTablet ? 70 : 80,
                height: isMobile ? 60 : isTablet ? 70 : 80,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="taxi"
              size={iconSize.xlarge}
              color="#FFFFFF"
            />
          </View>
          <Text
            style={[
              styles.headerTitle,
              {
                fontSize: fontSize['3xl'],
                marginTop: isMobile ? 10 : 15,
              },
            ]}
          >
            Dispatcher Dashboard
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              {
                fontSize: fontSize.md,
                marginTop: isMobile ? 4 : 6,
              },
            ]}
          >
            Real-time taxi management system
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.container,
          {
            width: containerWidth,
            alignSelf: 'center',
            paddingVertical: isMobile ? 15 : 20,
          },
        ]}
      >
        <View
          style={[
            styles.routeCard,
            {
              marginBottom: isMobile ? 20 : 24,
              padding: isMobile ? 20 : isTablet ? 24 : 28,
            },
          ]}
        >
          <View style={styles.routeHeader}>
            <Ionicons
              name="location-sharp"
              size={iconSize.medium}
              color="#4169E1"
            />
            <Text
              style={[
                styles.routeLabel,
                { fontSize: fontSize.md, marginLeft: isMobile ? 8 : 10 },
              ]}
            >
              Assigned Route
            </Text>
          </View>
          <Text
            style={[
              styles.routeValue,
              {
                fontSize: fontSize['2xl'],
                marginBottom: isMobile ? 15 : 20,
              },
            ]}
          >
            {assignedRoutes || 'Loading...'}
          </Text>
          <View style={styles.routeStats}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="users" size={iconSize.small} color="#FFFFFF" />
              </View>
              <Text
                style={[
                  styles.statLabel,
                  { fontSize: fontSize.xs, marginTop: isMobile ? 4 : 6 },
                ]}
              >
                Passengers
              </Text>
              <Text style={[styles.statNumber, { fontSize: fontSize['2xl'] }]}>
                {currentPassengers || '0'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons
                  name="taxi"
                  size={iconSize.small}
                  color="#FFFFFF"
                />
              </View>
              <Text
                style={[
                  styles.statLabel,
                  { fontSize: fontSize.xs, marginTop: isMobile ? 4 : 6 },
                ]}
              >
                Available Taxis
              </Text>
              <Text style={[styles.statNumber, { fontSize: fontSize['2xl'] }]}>
                {availabletaxis.count || '0'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons
                  name="car-multiple"
                  size={iconSize.small}
                  color="#FFFFFF"
                />
              </View>
              <Text
                style={[
                  styles.statLabel,
                  { fontSize: fontSize.xs, marginTop: isMobile ? 4 : 6 },
                ]}
              >
                In Queue
              </Text>
              <Text style={[styles.statNumber, { fontSize: fontSize['2xl'] }]}>
                {taxiData?.length || '0'}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.mainGrid,
            {
              flexDirection: isTablet || isLargeScreen ? 'row' : 'column',
              gap: isMobile ? 20 : 24,
            },
          ]}
        >
          <View
            style={[
              styles.section,
              {
                flex: 1,
                padding: isMobile ? 20 : isTablet ? 24 : 28,
                minHeight: 350,
              },
            ]}
          >
            <View
              style={[
                styles.sectionHeader,
                { marginBottom: isMobile ? 20 : 24 },
              ]}
            >
              <View
                style={[
                  styles.sectionIcon,
                  {
                    width: isMobile ? 45 : 50,
                    height: isMobile ? 45 : 50,
                    marginRight: isMobile ? 12 : 16,
                  },
                ]}
              >
                <Feather name="users" size={iconSize.medium} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.sectionTitle, { fontSize: fontSize.xl }]}>
                  Passenger Management
                </Text>
                <Text
                  style={[styles.sectionSubtitle, { fontSize: fontSize.xs }]}
                >
                  Update waiting passenger count
                </Text>
              </View>
            </View>

            <View style={[styles.inputCard, { padding: isMobile ? 16 : 20 }]}>
              <View style={styles.inputLabelContainer}>
                <Feather
                  name="user-plus"
                  size={iconSize.medium}
                  color="#4169E1"
                />
                <Text
                  style={[
                    styles.inputLabel,
                    {
                      fontSize: fontSize.sm,
                      marginLeft: isMobile ? 6 : 8,
                    },
                  ]}
                >
                  Current Waiting Count
                </Text>
              </View>
              <TextInput
                onChangeText={setWaitingCount}
                value={WaitingCount}
                placeholder="Enter number"
                placeholderTextColor="#94A3B8"
                style={[
                  styles.input,
                  {
                    height: isMobile ? 50 : 56,
                    fontSize: fontSize['2xl'],
                    marginBottom: isMobile ? 16 : 20,
                  },
                ]}
                keyboardType="numeric"
                editable={!isUpdating}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  { height: isMobile ? 48 : 52 },
                  pressed && styles.buttonPressed,
                  isUpdating && styles.buttonDisabled,
                ]}
                onPress={handlePassengerSubmit}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Feather
                      name="loader"
                      size={iconSize.medium}
                      color="#FFFFFF"
                      style={styles.spinningIcon}
                    />
                    <Text
                      style={[
                        styles.primaryButtonText,
                        { fontSize: fontSize.sm },
                      ]}
                    >
                      Updating...
                    </Text>
                  </>
                ) : (
                  <>
                    <Feather
                      name="check-circle"
                      size={iconSize.medium}
                      color="#FFFFFF"
                    />
                    <Text
                      style={[
                        styles.primaryButtonText,
                        { fontSize: fontSize.sm, paddingLeft: 4 },
                      ]}
                    >
                      Update Passenger Count
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          <View
            style={[
              styles.section,
              {
                flex: 1,
                padding: isMobile ? 20 : isTablet ? 24 : 28,
                minHeight: 350,
              },
            ]}
          >
            <View
              style={[
                styles.sectionHeader,
                { marginBottom: isMobile ? 20 : 24 },
              ]}
            >
              <View
                style={[
                  styles.sectionIcon,
                  {
                    backgroundColor: '#10B981',
                    width: isMobile ? 45 : 50,
                    height: isMobile ? 45 : 50,
                    marginRight: isMobile ? 12 : 16,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="car-multiple"
                  size={iconSize.medium}
                  color="#FFFFFF"
                />
              </View>
              <View>
                <Text style={[styles.sectionTitle, { fontSize: fontSize.xl }]}>
                  Taxi Queue
                </Text>
                <Text
                  style={[styles.sectionSubtitle, { fontSize: fontSize.xs }]}
                >
                  Manage taxi assignments and status
                </Text>
              </View>
            </View>

            <View style={[styles.queueContainer, { flex: 1 }]}>
              {taxiData?.length === 0 ? (
                <View
                  style={[
                    styles.emptyState,
                    { paddingVertical: isMobile ? 30 : 40 },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="car-cog"
                    size={iconSize.xlarge}
                    color="#CBD5E1"
                  />
                  <Text
                    style={[
                      styles.emptyTitle,
                      {
                        fontSize: fontSize.lg,
                        marginTop: isMobile ? 12 : 16,
                      },
                    ]}
                  >
                    No Taxis in Queue
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtitle,
                      {
                        fontSize: fontSize.xs,
                        marginTop: isMobile ? 4 : 8,
                      },
                    ]}
                  >
                    Add taxis to start managing the queue
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.queueScroll}
                  showsVerticalScrollIndicator={isLargeScreen}
                >
                  {isTaxiDataLoading && (taxiData ?? []).length > 0 && (
                    <Text>Updating...</Text>
                  )}

                  {taxiData?.map((t, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.taxiCard,
                        t.assigned && styles.taxiCardAssigned,
                        {
                          padding: isMobile ? 14 : 16,
                          marginBottom: isMobile ? 10 : 12,
                        },
                      ]}
                    >
                      <View style={styles.taxiInfo}>
                        <View
                          style={[
                            styles.taxiNumber,
                            {
                              width: isMobile ? 32 : 36,
                              height: isMobile ? 32 : 36,
                              marginRight: isMobile ? 10 : 12,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.taxiIndex,
                              { fontSize: fontSize.sm },
                            ]}
                          >
                            {idx + 1}
                          </Text>
                        </View>
                        <View style={styles.taxiDetails}>
                          <View style={styles.taxiPlateRow}>
                            <MaterialCommunityIcons
                              name="car"
                              size={iconSize.small}
                              color="#64748B"
                            />
                            <Text
                              style={[
                                styles.taxiPlate,
                                { fontSize: fontSize.md, marginLeft: 6 },
                              ]}
                            >
                              {t.PlateNo}
                            </Text>
                          </View>
                          <View style={styles.taxiStatus}>
                            {t.assigned ? (
                              <>
                                <Feather
                                  name="check-circle"
                                  size={iconSize.small}
                                  color="#10B981"
                                />
                                <Text
                                  style={[
                                    styles.taxiStatusText,
                                    { fontSize: fontSize.xs, marginLeft: 4 },
                                  ]}
                                >
                                  Assigned to {t.to_route || 'Trip'}
                                </Text>
                              </>
                            ) : (
                              <>
                                <Feather
                                  name="clock"
                                  size={iconSize.small}
                                  color="#F59E0B"
                                />
                                <Text
                                  style={[
                                    styles.taxiStatusText,
                                    { fontSize: fontSize.xs, marginLeft: 4 },
                                  ]}
                                >
                                  Waiting for Assignment
                                </Text>
                              </>
                            )}
                          </View>
                        </View>
                      </View>

                      {t.assigned ? (
                        <View
                          style={[
                            styles.actionButton,
                            styles.actionButtonDisabled,
                            {
                              paddingVertical: isMobile ? 8 : 10,
                              paddingHorizontal: isMobile ? 12 : 16,
                            },
                          ]}
                        >
                          <Feather
                            name="check"
                            size={iconSize.small}
                            color="#FFFFFF"
                          />
                          {!isMobile && (
                            <Text
                              style={[
                                styles.actionButtonText,
                                { fontSize: fontSize.xs, marginLeft: 4 },
                              ]}
                            >
                              Assigned
                            </Text>
                          )}
                        </View>
                      ) : (
                        <Pressable
                          style={({ pressed }) => [
                            styles.actionButton,
                            styles.actionButtonActive,
                            {
                              paddingVertical: isMobile ? 8 : 10,
                              paddingHorizontal: isMobile ? 12 : 16,
                            },
                            pressed && styles.actionButtonPressed,
                          ]}
                          onPress={() => removeTaxi(t.PlateNo)}
                        >
                          <Feather
                            name="check-circle"
                            size={iconSize.small}
                            color="#FFFFFF"
                          />
                          {!isMobile && (
                            <Text
                              style={[
                                styles.actionButtonText,
                                { fontSize: fontSize.xs, marginLeft: 4 },
                              ]}
                            >
                              Mark as On Trip
                            </Text>
                          )}
                        </Pressable>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <View
              style={[
                styles.actionButtons,
                { gap: isMobile ? 10 : 12, marginTop: 20 },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  styles.buttonWithIcon,
                  { height: isMobile ? 48 : 52, flex: 1 },
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => setShowModal(true)}
              >
                <Feather
                  name="plus-circle"
                  size={iconSize.medium}
                  color="#FFFFFF"
                />
                <Text
                  style={[styles.primaryButtonText, { fontSize: fontSize.sm }]}
                >
                  Register New Taxi
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  styles.buttonWithIcon,
                  { height: isMobile ? 48 : 52, flex: 1 },
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => router.push('/(tabs)/availableTaxi')}
              >
                <Feather name="list" size={iconSize.medium} color="#FFFFFF" />
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { fontSize: fontSize.sm },
                  ]}
                >
                  View All Taxis
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Modal */}
        {showModal && (
          <TaxiRegistration
            visible={showModal}
            onClose={() => setShowModal(false)}
          />
        )}

       
        <View
          style={[
            styles.footer,
            {
              paddingTop: isMobile ? 15 : 20,
              marginTop: isMobile ? 15 : 20,
            },
          ]}
        >
          <View style={styles.footerInfo}>
            <Feather name="refresh-cw" size={iconSize.small} color="#94A3B8" />
            <Text
              style={[
                styles.footerText,
                { fontSize: fontSize.xs, marginLeft: 6 },
              ]}
            >
              Auto-refreshing every 5 seconds
            </Text>
          </View>
          <View style={styles.footerInfo}>
            <MaterialCommunityIcons
              name="taxi"
              size={iconSize.small}
              color="#94A3B8"
            />
            <Text
              style={[
                styles.footerVersion,
                { fontSize: fontSize.xs, marginLeft: 6 },
              ]}
            >
              Taxi Dispatcher v1.0
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: '#4169E1',
    width: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#4169E1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  profileName: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4757',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconContainer: {
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  container: {
    flex: 1,
  },
  mainGrid: {
    width: '100%',
  },
  routeCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeLabel: {
    fontWeight: '600',
    color: '#334155',
  },
  routeValue: {
    fontWeight: '700',
    color: '#4169E1',
    textAlign: 'center',
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4169E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: '#64748B',
    fontWeight: '500',
  },
  statNumber: {
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    borderRadius: 12,
    backgroundColor: '#4169E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionSubtitle: {
    color: '#64748B',
    marginTop: 4,
  },
  inputCard: {
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0EAFF',
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 20,
    color: '#1E293B',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#4169E1',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#4169E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#003B73',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#003B73',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonWithIcon: {
    paddingHorizontal: 16,
    gap: 10,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  spinningIcon: {
    animationDuration: '1s',
    animationIterationCount: 'infinite',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  queueContainer: {
    flex: 1,
    minHeight: 200,
  },
  queueScroll: {
    flex: 1,
  },
  taxiCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taxiCardAssigned: {
    backgroundColor: '#F0F9FF',
    borderColor: '#E0F2FE',
  },
  taxiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taxiNumber: {
    borderRadius: 10,
    backgroundColor: '#4169E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taxiIndex: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  taxiDetails: {
    flex: 1,
  },
  taxiPlateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  taxiPlate: {
    fontWeight: '700',
    color: '#1E293B',
  },
  taxiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taxiStatusText: {
    color: '#64748B',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
  },
  actionButtonActive: {
    backgroundColor: '#10B981',
  },
  actionButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: '#94A3B8',
  },
  footerVersion: {
    color: '#CBD5E1',
    fontWeight: '600',
  },
});
