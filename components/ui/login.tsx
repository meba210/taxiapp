import React, { useState } from "react";
import { StyleSheet, View, TextInput, Text, Pressable, TouchableOpacity, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import BASE_URL from '@/utils/config';
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password");
      return;
    
    }

    try {
      setLoading(true);
      console.log("url:",BASE_URL)
     const res = await axios.post(
  `${BASE_URL}/auth/login`,
  { UserName: username, Password: password },
  {
    withCredentials: Platform.OS === "web" ? true : false,
  }
);
       
      const { role, token } = res.data;
      
      if (!token) {
        Alert.alert("Login Failed", "No token returned from server");
        return;
      }

       await AsyncStorage.setItem("token", token);

      // Navigate based on role
     if (role === "dispacher") router.push("/taxiDispacher");
      else Alert.alert("Error", "Unknown role!");

    } catch (err: any) {
      console.error(err);
      Alert.alert("Login Failed", err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.login}>
      <Text style={{ fontSize: 30, paddingBottom: 30 }}>LOGIN PAGE</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { backgroundColor: "#005BBB" },
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Logging in..." : "Log In"}</Text>
      </Pressable>

      <TouchableOpacity>
        <Text style={styles.linkText}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  login: {
    justifyContent: "center",
    borderRadius: 50,
    backgroundColor: "#add8e6",
    width: 350,
    height: 450,
    marginTop: 100,
    marginLeft: 20,
    alignItems: "center",
    paddingBottom: 60,
    paddingTop: 50,
  },
  input: {
    borderColor: "blue",
    borderRadius: 40,
    fontSize: 20,
    borderWidth: 2,
    height: 50,
    width: 300,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    width: 200,
    height: 50,
    backgroundColor: "#4169e1",
    borderRadius: 10,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
  },
  linkText: {
    color: "#cd5c5c",
    marginTop: 10,
  },
  signupText: {
    color: "#4169e1",
    fontSize: 20,
    paddingTop: 10,
  },
});
