import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Pressable,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import BASE_URL from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons"; // Import Feather icons

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // For toggling password

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }

    try {
      setLoading(true);
      console.log("url:", BASE_URL);
      const res = await axios.post(
        `${BASE_URL}/auth/login`,
        { UserName: username, Password: password },
        {
          withCredentials: true,
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
      Alert.alert(
        "Login Failed",
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.login}>
      <View style={styles.container}>
        <Text style={styles.title}>LOGIN PAGE</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#4169e1"
            />
          </TouchableOpacity>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { backgroundColor: "#005BBB" },
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Log In"}
          </Text>
        </Pressable>

        <TouchableOpacity>
          <Text style={styles.linkText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  login: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 20,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4169e1",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderColor: "#4169e1",
    borderWidth: 2,
    borderRadius: 25,
    fontSize: 18,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 20,
    color: "#000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    padding: 5,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#4169e1",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  linkText: {
    color: "#4169e1",
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
  },
});


