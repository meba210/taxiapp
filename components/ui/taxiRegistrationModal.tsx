// import {
//   View, Text, StyleSheet, Modal, TextInput, Pressable, Alert
// } from "react-native";
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import BASE_URL from "@/utils/config";
// interface Props {
//   visible: boolean;
//   onClose: () => void;
//   onTaxiCreated: () => void;
// }

// export default function TaxiRegistration({ visible, onClose, onTaxiCreated }: Props) {
//   const [DriversName, setDriversName] = useState("");
//   const [LicenceNo, setLicenceNo] = useState("");
//   const [PlateNo, setPlateNo] = useState("");
//   const [assignedRoute, setAssignedRoute] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchAssignedRoute();
//   }, []);

//   // Fetch the route assigned to the logged-in dispatcher
//   const fetchAssignedRoute = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) return Alert.alert("Error", "No token found");

//       const res = await axios.get(`${BASE_URL}/dispacher-route`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setAssignedRoute(res.data.route);
//     } catch (err: any) {
//       console.error(err);
//       Alert.alert("Error", "Failed to fetch assigned route");
//     }
//   };

//   const handleCreate = async () => {
//     if (!DriversName || !LicenceNo || !PlateNo || !assignedRoute) {
//       Alert.alert("Error", "Please fill all fields. Dispatcher route is missing.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("token");
//       if (!token) return Alert.alert("Error", "No token found");

//       await axios.post(
//         `${BASE_URL}/taxis`,
//         {
//           DriversName,
//           LicenceNo,
//           PlateNo,
//           route: assignedRoute, // use the dispatcher’s route directly
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       Alert.alert("Success", "Taxi registered successfully!");
//       onTaxiCreated();
//       onClose();

//       // Reset form
//       setDriversName("");
//       setLicenceNo("");
//       setPlateNo("");
//     } catch (err: any) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.message || "Failed to register taxi");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal visible={visible}
//      animationType="slide" transparent
//     onRequestClose={onClose}>
//       <View style={styles.overlay}>
//         <View style={styles.modalBox}>
//             <Pressable style={styles.closeButton} onPress={onClose}>
//     <Text style={{ fontSize: 18, fontWeight: "bold" }}>×</Text>
//   </Pressable>
//           <Text style={styles.title}>Register New Taxi</Text>

//           <TextInput
//             style={styles.input}
//             placeholder="Driver's Name"
//             value={DriversName}
//             onChangeText={setDriversName}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Licence Number"
//             value={LicenceNo}
//             onChangeText={setLicenceNo}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Plate Number"
//             value={PlateNo}
//             onChangeText={setPlateNo}
//           />

//           <Text style={styles.assignedRoute}>
//             Assigned Route: {assignedRoute || "Loading..."}
//           </Text>

//           <Pressable style={styles.button} onPress={handleCreate}>
//             <Text style={{ color: "white", fontSize: 18 }}>
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
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   modalBox: {
//     width: "90%",
//     backgroundColor: "white",
//     borderRadius: 15,
//     padding: 20,
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 20,
//   },
//   input: {
//     width: "100%",
//     height: 45,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     marginVertical: 5,
//   },
//   assignedRoute: {
//     marginTop: 10,
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   closeButton: {
//   position: "absolute",
//   top: 10,
//   right: 10,
//   padding: 5,
//   zIndex: 1,
// },

//   button: {
//     marginTop: 15,
//     backgroundColor: "#00bfff",
//     paddingVertical: 12,
//     paddingHorizontal: 40,
//     borderRadius: 10,
//   },
// });

import BASE_URL from '@/utils/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onTaxiCreated: () => void;
}

export default function TaxiRegistration({
  visible,
  onClose,
  onTaxiCreated,
}: Props) {
  const [DriversName, setDriversName] = useState('');
  const [PhoneNo, setPhoneNo] = useState('');
  const [LicenceNo, setLicenceNo] = useState('');
  const [PlateNo, setPlateNo] = useState('');
  const [assignedRoute, setAssignedRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State for validation errors
  const [errors, setErrors] = useState({
    DriversName: '',
    PhoneNo: '',
    LicenceNo: '',
    PlateNo: '',
    assignedRoute: '',
  });
  const [existingRecords, setExistingRecords] = useState<{
    licenceNos: string[];
    plateNos: string[];
  }>({
    licenceNos: [],
    plateNos: [],
  });

  useEffect(() => {
    fetchAssignedRoute();
    fetchExistingRecords();
  }, []);

  // Fetch the route assigned to the logged-in dispatcher
  const fetchAssignedRoute = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Error', 'No token found');

      const res = await axios.get(`${BASE_URL}/dispacher-route`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssignedRoute(res.data.route);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch assigned route');
    }
  };

  // Fetch existing licence and plate numbers for validation
  const fetchExistingRecords = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/taxis/existing-records`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        setExistingRecords({
          licenceNos: res.data.licenceNos || [],
          plateNos: res.data.plateNos || [],
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch existing records:', err);
    }
  };

  // Validation function
  const validateInputs = () => {
    const newErrors = {
      DriversName: '',
      PhoneNo: '',
      LicenceNo: '',
      PlateNo: '',
      assignedRoute: '',
    };
    let isValid = true;

    // Check if all fields are filled
    if (!DriversName.trim()) {
      newErrors.DriversName = "Driver's name is required";
      isValid = false;
    }
    if (!PhoneNo.trim()) {
      newErrors.PhoneNo = 'Phone number is required';
      isValid = false;
    }
    if (!LicenceNo.trim()) {
      newErrors.LicenceNo = 'Licence number is required';
      isValid = false;
    }
    if (!PlateNo.trim()) {
      newErrors.PlateNo = 'Plate number is required';
      isValid = false;
    }
    if (!assignedRoute) {
      newErrors.assignedRoute = 'Assigned route is missing';
      isValid = false;
    }

    // Validate driver's name (characters only)
    if (DriversName.trim() && !/^[A-Za-z\s]+$/.test(DriversName.trim())) {
      newErrors.DriversName = "Driver's name must contain only letters";
      isValid = false;
    }

    // Validate licence number (exactly 5 digits)
    if (LicenceNo.trim()) {
      if (!/^\d{6}$/.test(LicenceNo.trim())) {
        newErrors.LicenceNo = 'Licence number must be exactly 6 digits';
        isValid = false;
      }
      // Check for duplicate licence number
      if (existingRecords.licenceNos.includes(LicenceNo.trim())) {
        newErrors.LicenceNo = 'Licence number already exists';
        isValid = false;
      }
    }

    // Validate plate number (starts with A, B, or C followed by 5 digits)
    if (PlateNo.trim()) {
      if (!/^\d{5}$/.test(PlateNo.trim())) {
        newErrors.PlateNo = 'Plate number must  by 5 digits';
        isValid = false;
      }
      // Check for duplicate plate number
      if (existingRecords.plateNos.includes(PlateNo.trim())) {
        newErrors.PlateNo = 'Plate number already exists';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreate = async () => {
    // First validate inputs
    if (!validateInputs()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    if (!DriversName || !PhoneNo || !LicenceNo || !PlateNo || !assignedRoute) {
      Alert.alert(
        'Error',
        'Please fill all fields. Dispatcher route is missing.'
      );
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Error', 'No token found');

      await axios.post(
        `${BASE_URL}/taxis`,
        {
          DriversName,
          PhoneNo,
          LicenceNo,
          PlateNo,
          route: assignedRoute,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Taxi registered successfully!');
      onTaxiCreated();
      onClose();

      // Reset form and errors
      setDriversName('');
      setLicenceNo('');
      setPlateNo('');
      setErrors({
        DriversName: '',
        LicenceNo: '',
        PhoneNo: '',
        PlateNo: '',
        assignedRoute: '',
      });

      // Refresh existing records
      fetchExistingRecords();
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to register taxi'
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to clear error when user starts typing
  const clearError = (field: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>×</Text>
          </Pressable>
          <Text style={styles.title}>Register New Taxi</Text>

          <TextInput
            style={[
              styles.input,
              errors.DriversName ? styles.inputError : null,
            ]}
            placeholder="Driver's Name"
            value={DriversName}
            onChangeText={(text) => {
              setDriversName(text);
              clearError('DriversName');
            }}
          />
          {errors.DriversName ? (
            <Text style={styles.errorText}>{errors.DriversName}</Text>
          ) : null}

          <TextInput
            style={[styles.input, errors.PhoneNo ? styles.inputError : null]}
            placeholder="Driver's Phone Number"
            value={PhoneNo}
            onChangeText={(text) => {
              setPhoneNo(text);
              clearError('PhoneNo');
            }}
            keyboardType="numeric"
            maxLength={13}
          />
          {errors.PhoneNo ? (
            <Text style={styles.errorText}>{errors.PhoneNo}</Text>
          ) : null}

          <TextInput
            style={[styles.input, errors.LicenceNo ? styles.inputError : null]}
            placeholder="Licence Number"
            value={LicenceNo}
            onChangeText={(text) => {
              setLicenceNo(text);
              clearError('LicenceNo');
            }}
            keyboardType="numeric"
            maxLength={6}
          />
          {errors.LicenceNo ? (
            <Text style={styles.errorText}>{errors.LicenceNo}</Text>
          ) : null}

          <TextInput
            style={[styles.input, errors.PlateNo ? styles.inputError : null]}
            placeholder="Plate Number (e.g., 12345)"
            value={PlateNo}
            onChangeText={(text) => {
              setPlateNo(text.toUpperCase());
              clearError('PlateNo');
            }}
            maxLength={6}
          />
          {errors.PlateNo ? (
            <Text style={styles.errorText}>{errors.PlateNo}</Text>
          ) : null}

          <Text style={styles.assignedRoute}>
            Assigned Route: {assignedRoute || 'Loading...'}
          </Text>
          {errors.assignedRoute ? (
            <Text style={styles.errorText}>{errors.assignedRoute}</Text>
          ) : null}

          <Pressable
            style={styles.button}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>
              {loading ? 'Registering...' : 'Register'}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    width: '60%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '70%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 4,
    marginRight: 45,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginLeft: 80,
    marginTop: -5,
    marginBottom: 5,
  },
  assignedRoute: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  button: {
    marginTop: 15,
    backgroundColor: '#00bfff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
});
