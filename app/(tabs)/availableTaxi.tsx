import axios from "axios";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import BASE_URL from "@/utils/config";
interface Taxi {
  PlateNo: string;
}

export default function AvailableTaxi() {
  const [taxis, setTaxis] = useState<Taxi[]>([]);
  const [assignedtaxis, setAssignedTaxis] = useState<Taxi[]>([]);
  const [queuedPlates, setQueuedPlates] = useState<string[]>([]); // NEW: disable logic
 const [route, setRoute] = useState<string | null>(null);
  const addToQueue = async (PlateNo: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      await axios.post(
        `${BASE_URL}/taxi-queue`,
        { PlateNo,route:route },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Taxi ${PlateNo} added to queue`);

      // Disable button immediately
      setQueuedPlates((prev) => [...prev, PlateNo]);
    } catch (err) {
      console.error(err);
      alert("Failed to add taxi");
    }
  };


   const fetchRoute = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Error", "No token found");

      const res = await axios.get(`${BASE_URL}/dispacher-route`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRoute(res.data.route); // route is just the name
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch assigned route");
    }
  };


  useEffect(() => {
     fetchRoute();
    }, []);


  const fetchTaxis = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/taxis`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTaxis(res.data);
    } catch (err) {
      console.error("Failed to fetch taxis:", err);
    }
  };


   const fetchAssignedTaxis = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
        if (!route) return;
       const res = await axios.get(
      `${BASE_URL}/assignTaxis/assignedTaxis?route=${encodeURIComponent(route)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

      setAssignedTaxis(res.data);
    } catch (err) {
      console.error("Failed to fetch taxis:", err);
    }
  };



  const fetchQueueState = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/taxi-queue`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const activePlates = res.data.map((t: Taxi) => t.PlateNo);
      setQueuedPlates(activePlates);
    } catch (err) {
      console.error("Failed to sync queue state:", err);
    }
  };

  useEffect(() => {
    fetchTaxis();
    fetchQueueState();
    fetchAssignedTaxis();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
       <Pressable
        style={styles.backButton}
        onPress={() => router.push("/(tabs)/taxiDispacher")}
      >
        <Text style={styles.backText}>←</Text>
      </Pressable>
      <Text style={styles.title}>Available Taxis</Text>

      {taxis.length === 0 ? (
        <Text style={styles.empty}>No taxis available</Text>
      ) : (
        taxis.map((t, index) => {
          const isQueued = queuedPlates.includes(t.PlateNo);

          return (
            <View key={index} style={styles.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.label}>
                  Taxi: <Text style={styles.value}>{t.PlateNo}</Text>
                </Text>

                <Pressable
                  style={[
                    styles.button,
                    isQueued && styles.buttonDisabled,
                  ]}
                  disabled={isQueued}
                  onPress={() => addToQueue(t.PlateNo)}
                >
                  <Text style={styles.buttonText}>
                    {isQueued ? "Added" : "Add to Queue"}
                  </Text>
                </Pressable>
                
              </View>
              
            </View>
            
          );
        })
      )}
            <View style={{ marginTop: 20 }}>
        <Pressable
          style={styles.button}
          onPress={fetchAssignedTaxis}
        >
          <Text style={styles.buttonText}>Assigned Taxis</Text>
        </Pressable>

        {assignedtaxis.length === 0 ? (
          <Text style={styles.empty}>No assigned taxis yet</Text>
        ) : (
          assignedtaxis.map((t, index) => {
              const isQueued = queuedPlates.includes(t.PlateNo);
              return(
                   <View key={index} style={styles.card}>
              <Text style={styles.label}>
                Taxi: <Text style={styles.value}>{t.PlateNo}</Text>
              </Text>
              <Pressable
                  style={[
                    styles.button,
                    isQueued && styles.buttonDisabled,
                  ]}
                  disabled={isQueued}
                  onPress={() => addToQueue(t.PlateNo)}
                >
                  <Text style={styles.buttonText}>
                    {isQueued ? "Added" : "Add to Queue"}
                  </Text>
                </Pressable>
            </View>
          )}
        ))}
      </View>
    </ScrollView>
  );
}

/* --------------------- STYLES ------------------------ */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#003B73",
  },

  /* Back Button */
  backButton: {
    backgroundColor: "#005BBB",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backText: {
    color: "white",
    fontSize: 25,
    fontWeight: "600",
  },

  empty: {
    fontSize: 18,
    fontStyle: "italic",
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },

  card: {
    backgroundColor: "#e6f2ff",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#b3d9ff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  label: {
    fontSize: 20,
    fontWeight: "600",
    color: "#003B73",
  },

  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#005BBB",
  },

  button: {
    backgroundColor: "#005BBB",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignSelf: "center",
  },

  buttonDisabled: {
    backgroundColor: "#9BBBD4",
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});

