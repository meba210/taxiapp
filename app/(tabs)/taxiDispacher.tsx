import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import TaxiRegistration from "@/components/ui/taxiRegistrationModal";
import axios from "axios";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "@/utils/config";


export default function TaxiDispatcher() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<{ PlateNo: string }[]>([]);
  const [WaitingCount, setWaitingCount] = useState("");
  const [Status, setStatus] = useState("");
const [passengerId, setPassengerId] = useState<number | null>(null);
  

const fetchPassengerQueue = async () => {
  const token = await AsyncStorage.getItem("token");
  const res = await axios.get(`${BASE_URL}/passengerqueue`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.data.length > 0) {
    const myRecord = res.data[0]; // only one row per dispatcher
    setPassengerId(myRecord.id);
    setWaitingCount(myRecord.waiting_count.toString());
  }
};

  const fetchQueue = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/taxi-queue`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setQueue(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  // Remove Taxi From Queue
  const removeTaxi = async (plateNo: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      await axios.delete(`${BASE_URL}/taxi-queue/${plateNo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchQueue();
    } catch (err) {
      console.error(err);
      alert("Failed to remove taxi");
    }
  };

  // Update Passenger Count
const handlePassengerSubmit = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    if (!WaitingCount) {
      alert("Please enter passenger count");
      return;
    }

    if (passengerId) {
      // Update existing record (backend uses dispatcher_id from JWT)
      await axios.put(
        `${BASE_URL}/passengerqueue/${passengerId}`,
        { waiting_count: WaitingCount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Passenger count updated!");
    } else {
      // Add new record (backend uses dispatcher_id from JWT)
      const res = await axios.post(
        `${BASE_URL}/passengerqueue`,
        { waiting_count: WaitingCount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPassengerId(res.data.id);
      alert("Passenger count added!");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to submit");
  }
};


  return (
    <ScrollView style={{ backgroundColor: "white" }}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.headerLabel}>Station:</Text>
        <Text style={styles.headerLabel}>Route:</Text>

        {/* PASSENGERS WAITING */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passengers Waiting</Text>

          <TextInput
            onChangeText={setWaitingCount}
            placeholder="14"
            placeholderTextColor="#777"
            style={styles.input}
            keyboardType="numeric"
          />

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.8 }
            ]}
            onPress={handlePassengerSubmit}
          >
            <Text style={styles.primaryButtonText}>Update Number</Text>
          </Pressable>
        </View>

        {/* TAXI QUEUE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taxi Waiting</Text>

          {queue.length === 0 ? (
            <Text style={styles.empty}>No taxis in queue</Text>
          ) : (
            queue.map((t, idx) => (
              <View key={idx} style={styles.taxiRow}>
                <Text style={styles.taxiText}>
                  {idx + 1}. {t.PlateNo}
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.removeButton,
                    pressed && { opacity: 0.7 }
                  ]}
                  onPress={() => removeTaxi(t.PlateNo)}
                >
                  <Text style={styles.removeButtonText}>On_Trip</Text>
                </Pressable>
              </View>
            ))
          )}

          {/* Add new taxi */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.primaryButtonText}>New Taxi</Text>
          </Pressable>

          {showModal && (
            <TaxiRegistration
              visible={showModal}
              onClose={() => setShowModal(false)}
              onTaxiCreated={() => fetchQueue()}
            />
          )}

          {/* Go to Available Taxi List */}
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => router.push("/(tabs)/availableTaxi")}
          >
            <Text style={styles.secondaryButtonText}>Taxi List</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

/* -------------------------- STYLES -------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
  },

  headerLabel: {
    width: "90%",
    fontSize: 20,
    color: "#003B73",
    fontWeight: "600",
    marginBottom: 5,
  },

  section: {
    backgroundColor: "#e6f2ff",
    width: "90%",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#003B73",
    marginBottom: 15,
    textAlign: "center",
  },

  input: {
    width: "100%",
    height: 55,
    fontSize: 32,
    backgroundColor: "white",
    borderRadius: 12,
    paddingLeft: 15,
    color: "black",
    borderWidth: 1,
    borderColor: "#cce0ff",
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: "#005BBB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  primaryButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },

  secondaryButton: {
    backgroundColor: "#003B73",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  secondaryButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },

  taxiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#cce0ff",
  },

  taxiText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#003B73",
  },

  removeButton: {
    backgroundColor: "#cc0000",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  removeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  empty: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
    marginBottom: 15,
  },
});
