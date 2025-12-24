
import TaxiRegistration from "@/components/ui/taxiRegistrationModal";
import BASE_URL from "@/utils/config";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

export default function TaxiDispatcher() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<{
    assigned: any; PlateNo: string;   status?: string;  to_route?: string | null;
  }[]>([]);
  const [WaitingCount, setWaitingCount] = useState("");
  const [Status, setStatus] = useState("");
  const [route, setRoute] = useState<string | null>(null);
  //const [to_route, setto_Route] = useState<string | null>(null);
  const [passengerId, setPassengerId] = useState<number | null>(null);
  const [assignedRoute, setAssignedRoute] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
const[currentpassengers,setCurrentPassengers]= useState< number |null>(null);
const[availabletaxis,setAvailableTaxis]= useState< number |null>(null);




useFocusEffect(
  React.useCallback(() => {
    // Reset state when screen comes into focus
    setQueue([]);
    setWaitingCount("");
    setStatus("");
    setRoute(null);
    setPassengerId(null);
    setAssignedRoute(null);
    
    // Fetch fresh data
    fetchRoute();
    fetchAssignedRoute();
    fetchUserProfile();
    fetchQueue();
    return () => {
      // Cleanup if needed
    };
  }, [])
);
  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      router.replace("/(tabs)/profile");
    } catch (err) {
      console.error("Failed to logout:", err);
      Alert.alert("Error", "Failed to logout");
    }
  };

 
  const fetchRoute = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Error", "No token found");

      const res = await axios.get(`${BASE_URL}/dispacher-route`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRoute(res.data.route);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch assigned route");
    }
  };

  useEffect(() => {
    fetchRoute();
    fetchAssignedRoute();
    fetchUserProfile();
    const interval = setInterval(fetchQueue, 50000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token || !route) return;

      // 1. First fetch all taxis currently in the queue
      const queueRes = await axios.get(`${BASE_URL}/taxi-queue`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Get the plate numbers from the queue
      const queuedPlates = queueRes.data.map((taxi: any) => taxi.PlateNo);

      // 3. Fetch assigned taxis but filter to only include those in the queue
      const assignedRes = await axios.get(
        `${BASE_URL}/assignTaxis/assigned?route=${encodeURIComponent(route)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4. Filter assigned taxis to only include those that are in the queue
      const assignedList = assignedRes.data.filter((a: any) => 
        queuedPlates.includes(a.PlateNo)
      );

      // 5. Merge the data - only show taxis that are in BOTH the queue and assigned list
      const mergedQueue = queueRes.data.map((taxi: any) => {
        const assignedRecord = assignedList.find(
          (a: any) => a.PlateNo === taxi.PlateNo
        );

        return {
          ...taxi,
           assigned: assignedRecord && assignedRecord.from_route === route,
             to_route: assignedRecord?.to_route || null,
           
        };
      });

      setQueue(mergedQueue);

    } catch (err) {
      console.error("Error fetching queue:", err);
    }
  };

  useEffect(() => {
    if (route) {
      fetchQueue();
      const interval = setInterval(fetchQueue, 5000);
      return () => clearInterval(interval);
    }
  }, [route]);

  const removeTaxi = async (plateNo: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      await axios.delete(`${BASE_URL}/taxi-queue/${plateNo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await axios.delete(`${BASE_URL}/assignTaxis/${plateNo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchQueue();
    } catch (err) {
      console.error(err);
      alert("Failed to remove taxi");
    }
  };

  const handlePassengerSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      if (!WaitingCount) {
        alert("Please enter passenger count");
        return;
      }

      setIsUpdating(true);
      
      if (passengerId) {
        await axios.put(
          `${BASE_URL}/passengerqueue/${passengerId}`,
          { waiting_count: WaitingCount },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert("Success", "Passenger count updated!");
      } else {
        const res = await axios.post(
          `${BASE_URL}/passengerqueue`,
          { waiting_count: WaitingCount, route: route },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPassengerId(res.data.id);
        Alert.alert("Success", "Passenger count added!");
      }
      
      setWaitingCount("");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit passenger count");
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchAssignedRoute = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Error", "No token found");

      const res = await axios.get(`${BASE_URL}/dispacher-route`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssignedRoute(res.data.route);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch assigned route");
    }
  };

 const fetchtaxis = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      
      if (!token || !route) return Alert.alert("Error", "No token found");
      // Use the component state `route` directly instead of redeclaring it
      const res = await axios.get(`${BASE_URL}/taxis/available`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { route }
      });

     setAvailableTaxis(res.data.count);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch assigned route");
    }
  };
  useEffect(() => {
         fetchtaxis ();
      const interval = setInterval( fetchtaxis , 3000);
      return () => clearInterval(interval);
    
  }, []);

   const fetchCurrentPassengers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Error", "No token found");

      const res = await axios.get(`${BASE_URL}/passengerqueue/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });

     setCurrentPassengers(res.data.count);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch assigned route");
    }
  };
  useEffect(() => {
   
      fetchCurrentPassengers ();
      const interval = setInterval( fetchCurrentPassengers, 3000);
      return () => clearInterval(interval);
    
  }, []);

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Header with Background */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeftSection}>
            {userProfile && (
              <View style={styles.profileBadge}>
                <Feather name="user" size={16} color="#FFFFFF" />
                <Text style={styles.profileName}>{userProfile.name || userProfile.email}</Text>
              </View>
            )}
          </View>
          
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={18} color="#FFFFFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="taxi" size={isWeb ? 40 : 34} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Dispatcher Dashboard</Text>
          <Text style={styles.headerSubtitle}>Real-time taxi management system</Text>
        </View>
      </View>

      <View style={styles.container}>
        {/* Route Info Card */}
        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <Ionicons name="location-sharp" size={24} color="#4169E1" />
            <Text style={styles.routeLabel}>Assigned Route</Text>
          </View>
          <Text style={styles.routeValue}>{assignedRoute || "Loading..."}</Text>
          <View style={styles.routeStats}>
            <View style={styles.statItem}>
              <Feather name="users" size={18} color="#64748B" />
              <Text style={styles.statText}>Passengers</Text>
              <Text style={styles.statNumber}>{currentpassengers || "0"}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="taxi" size={18} color="#64748B" />
              <Text style={styles.statText}>Taxis</Text>
              <Text style={styles.statNumber}>{availabletaxis || "0"}</Text>
            </View>
          </View>
        </View>

        {/* PASSENGERS WAITING Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Feather name="users" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Passenger Management</Text>
              <Text style={styles.sectionSubtitle}>Update waiting passenger count</Text>
            </View>
          </View>

          <View style={styles.inputCard}>
            <View style={styles.inputLabelContainer}>
              <Feather name="user-plus" size={20} color="#4169E1" />
              <Text style={styles.inputLabel}>Current Waiting Count</Text>
            </View>
            <TextInput
              onChangeText={setWaitingCount}
              value={WaitingCount}
              placeholder="Enter number of passengers"
              placeholderTextColor="#94A3B8"
              style={styles.input}
              keyboardType="numeric"
              editable={!isUpdating}
            />
            
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                isUpdating && styles.buttonDisabled
              ]}
              onPress={handlePassengerSubmit}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Feather name="loader" size={20} color="#FFFFFF" style={styles.spinningIcon} />
                  <Text style={styles.primaryButtonText}>Updating...</Text>
                </>
              ) : (
                <>
                  <Feather name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Update Passenger Count</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* TAXI QUEUE Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#10B981' }]}>
              <MaterialCommunityIcons name="car-multiple" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Taxi Queue Management</Text>
              <Text style={styles.sectionSubtitle}>Manage taxi assignments and status</Text>
            </View>
          </View>

          {/* Queue Stats */}
          <View style={styles.queueStats}>
            <View style={styles.queueStatCard}>
              <Text style={styles.queueStatNumber}>{availabletaxis || "0"}</Text>
              <Text style={styles.queueStatLabel}>Total Taxis</Text>
            </View>
            <View style={styles.queueStatCard}>
              <Text style={styles.queueStatNumber}>
                {queue.filter(t => !t.assigned).length}
              </Text>
              <Text style={styles.queueStatLabel}>Available</Text>
            </View>
          </View>

          {/* Taxi List */}
          <View style={styles.queueContainer}>
            {queue.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Taxis in Queue</Text>
                <Text style={styles.emptySubtitle}>Add taxis to start managing the queue</Text>
              </View>
            ) : (
              queue.map((t, idx) => (
                <View key={idx} style={[
                  styles.taxiCard,
                  t.assigned && styles.taxiCardAssigned
                ]}>
                  <View style={styles.taxiInfo}>
                    <View style={styles.taxiNumber}>
                      <Text style={styles.taxiIndex}>{idx + 1}</Text>
                    </View>
                    <View style={styles.taxiDetails}>
                      <Text style={styles.taxiPlate}>{t.PlateNo}</Text>
                      <View style={styles.taxiStatus}>
                        {t.assigned ? (
                          <>
                            <Feather name="check-circle" size={14} color="#10B981" />
                            <Text style={styles.taxiStatusText}>Assigned to Trip</Text>
                          </>
                        ) : (
                          <>
                            <Feather name="clock" size={14} color="#F59E0B" />
                            <Text style={styles.taxiStatusText}>Waiting for Assignment</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  {t.assigned ? (
                    <View style={[styles.actionButton, styles.actionButtonDisabled]}>
                      <Feather name="check" size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Assigned to {t.to_route || "Unknown"}</Text>
                    </View>
                  ) : (
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionButton,
                        styles.actionButtonActive,
                        pressed && styles.actionButtonPressed
                      ]}
                      onPress={() => removeTaxi(t.PlateNo)}
                    >
                      <Feather name="check-circle" size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Mark as On Trip</Text>
                    </Pressable>
                  )}
                </View>
              ))
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                styles.buttonWithIcon,
                pressed && styles.buttonPressed
              ]}
              onPress={() => setShowModal(true)}
            >
              <Feather name="plus-circle" size={22} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Register New Taxi</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                styles.buttonWithIcon,
                pressed && styles.buttonPressed
              ]}
              onPress={() => router.push("/(tabs)/availableTaxi")}
            >
              <Feather name="list" size={22} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>View All Taxis</Text>
            </Pressable>
          </View>
        </View>

        {/* Modal */}
        {showModal && (
          <TaxiRegistration
            visible={showModal}
            onClose={() => setShowModal(false)}
            onTaxiCreated={() => fetchQueue()}
          />
        )}

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Feather name="refresh-cw" size={14} color="#94A3B8" />
            <Text> Auto-refreshing every 5 seconds</Text>
          </Text>
          <Text style={styles.footerVersion}>Dispatcher v2.4</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: "#F8FAFC",
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#4169E1',
    width: '100%',
    paddingVertical: isWeb ? 40 : 30,
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
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    paddingHorizontal: 20,
  },
  headerIconContainer: {
    width: isWeb ? 80 : 70,
    height: isWeb ? 80 : 70,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: isWeb ? 32 : 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: isWeb ? 16 : 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingVertical: isWeb ? 30 : 20,
    paddingHorizontal: isWeb ? 20 : 15,
  },
  routeCard: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: isWeb ? 30 : 24,
    marginBottom: 24,
    shadowColor: "#000",
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
    fontSize: isWeb ? 18 : 16,
    fontWeight: '600',
    color: "#334155",
    marginLeft: 10,
  },
  routeValue: {
    fontSize: isWeb ? 28 : 24,
    fontWeight: '700',
    color: "#4169E1",
    marginBottom: 20,
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
  },
  statText: {
    fontSize: isWeb ? 14 : 12,
    color: "#64748B",
    marginTop: 6,
    fontWeight: '500',
  },
  statNumber: {
    fontSize: isWeb ? 24 : 20,
    fontWeight: '700',
    color: "#1E293B",
    marginTop: 4,
  },
  section: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: isWeb ? 30 : 24,
    marginBottom: 24,
    shadowColor: "#000",
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
    marginBottom: 24,
  },
  sectionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#4169E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: isWeb ? 22 : 20,
    fontWeight: '700',
    color: "#1E293B",
  },
  sectionSubtitle: {
    fontSize: isWeb ? 14 : 12,
    color: "#64748B",
    marginTop: 4,
  },
  inputCard: {
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0EAFF',
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: isWeb ? 16 : 14,
    fontWeight: '600',
    color: "#334155",
    marginLeft: 8,
  },
  input: {
    width: "100%",
    height: isWeb ? 60 : 56,
    fontSize: isWeb ? 32 : 28,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 20,
    color: "#1E293B",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: "#4169E1",
    height: isWeb ? 56 : 52,
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
    backgroundColor: "#003B73",
    height: isWeb ? 56 : 52,
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
    paddingHorizontal: 24,
    gap: 10,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: "#94A3B8",
  },
  spinningIcon: {
    // animationframe: {
    //   '0%': { transform: [{ rotate: '0deg' }] },
    //   '100%': { transform: [{ rotate: '360deg' }] },
    // },
    animationDuration: '1s',
    animationIterationCount: 'infinite',
  },
  primaryButtonText: {
    color: "white",
    fontSize: isWeb ? 18 : 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: isWeb ? 18 : 16,
    fontWeight: "600",
  },
  queueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  queueStatCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  queueStatNumber: {
    fontSize: isWeb ? 28 : 24,
    fontWeight: '700',
    color: "#4169E1",
  },
  queueStatLabel: {
    fontSize: isWeb ? 13 : 12,
    color: "#64748B",
    marginTop: 4,
    fontWeight: '500',
  },
  queueContainer: {
    marginBottom: 24,
  },
  taxiCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: "white",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4169E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taxiIndex: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  taxiDetails: {
    flex: 1,
  },
  taxiPlate: {
    fontSize: isWeb ? 18 : 16,
    fontWeight: '700',
    color: "#1E293B",
    marginBottom: 4,
  },
  taxiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taxiStatusText: {
    fontSize: isWeb ? 13 : 12,
    color: "#64748B",
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonActive: {
    backgroundColor: "#10B981",
  },
  actionButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionButtonText: {
    color: "white",
    fontSize: isWeb ? 14 : 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: isWeb ? 20 : 18,
    fontWeight: '600',
    color: "#64748B",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: isWeb ? 14 : 12,
    color: "#94A3B8",
    textAlign: 'center',
  },
  actionButtons: {
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerText: {
    fontSize: isWeb ? 13 : 11,
    color: "#94A3B8",
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerVersion: {
    fontSize: isWeb ? 13 : 11,
    color: "#CBD5E1",
    fontWeight: '600',
  },
});


