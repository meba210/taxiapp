// import { 
//   View, Text, StyleSheet, ActivityIndicator,Picker,
//   Button, Pressable, ScrollView, Modal, TextInput, 
//   Alert
// } from "react-native";
// import React, { useState } from "react";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// interface Props {
//   visible: boolean;
//   onClose: () => void;
//   onTaxiCreated: () => void;
// }

// export default function TaxiRegistration({ visible, onClose, onTaxiCreated }: Props) {
//   const [DriversName, setDriversName] = useState("");
//   const [LicenceNo, setLicenceNo] = useState("");
//   const [PlateNo, setPlateNo] = useState("");
//   const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleCreate = async () => {
//     if (!DriversName || !LicenceNo || !PlateNo|| !selectedRoute) {
//       alert("Please fill all fields");
//       return;
//     }

//     const token = await AsyncStorage.getItem("token");
// if (!token) {
//   console.log("the token is:",token)
//       Alert.alert("No token found. Please login again.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await axios.post(
//          "http://localhost:5000/taxis",
//         { DriversName, LicenceNo, PlateNo,  route_id: selectedRoute },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       alert(res.data.message || "Taxi registered successfully!");

//       onTaxiCreated?.();
//       onClose();
       
//       // Reset form
//       setDriversName("");
//       setLicenceNo("");
//       setPlateNo("");
//       setSelectedRoute(null);

//     } catch (err: any) {
//       console.error(err);
//       alert(err.response?.data?.message || "Failed to register taxi");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
//       <View style={styles.overlay}>
//         <View style={styles.modalBox}>
//           <Text style={{ paddingBottom: 30, paddingTop: 20, fontSize: 30 }}>
//             Register New Taxi
//           </Text>

//           <View style={styles.V1}>
//             <Text style={styles.Te}>Driver's Name:</Text>
//             <TextInput
//               style={styles.TeI}
//               placeholder="Full Name"
//               value={DriversName}
//               onChangeText={setDriversName}
//             />

//             <Text style={styles.Te}>License Number:</Text>
//             <TextInput
//               style={styles.TeI}
//               placeholder="#12345"
//               value={LicenceNo}
//               onChangeText={setLicenceNo}
//             />

//             <Text style={styles.Te}>Plate Number:</Text>
//             <TextInput
//               style={styles.TeI}
//               placeholder="Plate No"
//               value={PlateNo}
//               onChangeText={setPlateNo}
//             />
//           </View>
//             <Text>Route:</Text>
//           <Picker selectedValue={selectedRoute} onValueChange={(v:any) => setSelectedRoute(v)}>
//             {routes.map((r:any) => (
//               <Picker.Item key={r.id} label={`${r.StartTerminal} → ${r.EndTerminal}`} value={r.id} />
//             ))}
//           </Picker>
        

//           <Pressable
//             style={({ pressed }) => [
//               styles.b1,
//               pressed && { backgroundColor: "#005BBB" },
//             ]}
//             onPress={handleCreate}
//           >
//             <Text style={{ color: "white", fontSize: 20, textAlign: "center" }}>
//               {loading ? "Registering..." : "Register"}
//             </Text>
//           </Pressable>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalBox: {
//     width: "85%",
//     backgroundColor: "white",
//     borderRadius: 15,
//     padding: 20,
//     elevation: 10,
//     height: 580,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   V1: {
//     backgroundColor: "#87cefa",
//     borderRadius: 10,
//     width: 300,
//     height: 250,
//     marginBottom: 40,
//     alignItems: "center",
//     paddingTop: 10,
//     paddingBottom: 40,
//   },
//   V2: {
//     backgroundColor: "#87cefa",
//     borderRadius: 10,
//     width: 300,
//     height: 120,
//     alignItems: "center",
//     paddingTop: 10,
//   },
//   b1: {
//     borderRadius: 10,
//     width: 200,
//     height: 50,
//     backgroundColor: "#00bfff",
//     marginTop: 15,
//     paddingTop: 10,
//   },
//   Te: {
//     paddingRight: 140,
//     fontSize: 20,
//     paddingBottom: 10,
//   },
//   TeI: {
//     color: "black",
//     fontSize: 18,
//     borderRadius: 10,
//     backgroundColor: "white",
//     width: 250,
//     height: 40,
//     textAlign: "center",
//     paddingHorizontal: 10,
//   },
//   picker: {
//     width: 250,
//     height: 50,
//     backgroundColor: "white",
//     borderRadius: 10,
//   },
//   pickerItem: {
//     color: "black",
//     fontSize: 16,
//     textAlign: "center",
//   },
// });



import { 
  View, Text, StyleSheet, Modal, TextInput, Pressable, Alert 
} from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

interface Props {
  visible: boolean;
  onClose: () => void;
  onTaxiCreated: () => void;
}

interface Route {
  id: number;
  StartTerminal: string;
  EndTerminal: string;
}

export default function TaxiRegistration({ visible, onClose, onTaxiCreated }: Props) {
  const [DriversName, setDriversName] = useState("");
  const [LicenceNo, setLicenceNo] = useState("");
  const [PlateNo, setPlateNo] = useState("");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Error", "No token found");

      const res = await axios.get("http://localhost:5000/routes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoutes(res.data);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch routes");
    }
  };

  const handleCreate = async () => {
    if (!DriversName || !LicenceNo || !PlateNo || !selectedRoute) {
      Alert.alert("Error", "Please fill all fields and select a route");
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
          route_id: selectedRoute,
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
      setSelectedRoute(null);
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

         
          <View style={styles.pickerContainer}>
      <Text>Select Route:</Text>
      <Picker
        selectedValue={selectedRoute}
        onValueChange={(value) => setSelectedRoute(value)}
        style={styles. pickerContainer}
      >
        {routes.map((r) => (
          <Picker.Item
            key={r.id}
            label={`${r.StartTerminal} → ${r.EndTerminal}`}
            value={r.id} 
          />
        ))}
      </Picker>
    </View>

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
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 10,
  },
  button: {
    marginTop: 15,
    backgroundColor: "#00bfff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
});
