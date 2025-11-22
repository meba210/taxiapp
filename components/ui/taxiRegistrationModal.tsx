import { 
  View, Text, StyleSheet, Modal, TextInput, Pressable, Alert 
} from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  visible: boolean;
  onClose: () => void;
  onTaxiCreated: () => void;
}

export default function TaxiRegistration({ visible, onClose, onTaxiCreated }: Props) {
  const [DriversName, setDriversName] = useState("");
  const [LicenceNo, setLicenceNo] = useState("");
  const [PlateNo, setPlateNo] = useState("");
  const [assignedRoute, setAssignedRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignedRoute();
  }, []);

  // Fetch the route assigned to the logged-in dispatcher
  const fetchAssignedRoute = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Error", "No token found");

      const res = await axios.get("http://localhost:5000/dispacher-route", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssignedRoute(res.data.route); // route is just the name
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch assigned route");
    }
  };

  const handleCreate = async () => {
    if (!DriversName || !LicenceNo || !PlateNo || !assignedRoute) {
      Alert.alert("Error", "Please fill all fields. Dispatcher route is missing.");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Error", "No token found");

      await axios.post(
        "http://localhost:5000/taxis",
        {
          DriversName,
          LicenceNo,
          PlateNo,
          route: assignedRoute, // use the dispatcher’s route directly
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Taxi registered successfully!");
      onTaxiCreated();
      onClose();

      // Reset form
      setDriversName("");
      setLicenceNo("");
      setPlateNo("");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Failed to register taxi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Register New Taxi</Text>

          <TextInput
            style={styles.input}
            placeholder="Driver's Name"
            value={DriversName}
            onChangeText={setDriversName}
          />
          <TextInput
            style={styles.input}
            placeholder="Licence Number"
            value={LicenceNo}
            onChangeText={setLicenceNo}
          />
          <TextInput
            style={styles.input}
            placeholder="Plate Number"
            value={PlateNo}
            onChangeText={setPlateNo}
          />

          <Text style={styles.assignedRoute}>
            Assigned Route: {assignedRoute || "Loading..."}
          </Text>

          <Pressable style={styles.button} onPress={handleCreate}>
            <Text style={{ color: "white", fontSize: 18 }}>
              {loading ? "Registering..." : "Register"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  assignedRoute: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    marginTop: 15,
    backgroundColor: "#00bfff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
});

