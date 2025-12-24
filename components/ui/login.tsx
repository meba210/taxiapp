// import React, { useState } from "react";
// import {
//   StyleSheet,
//   View,
//   TextInput,
//   Text,
//   Pressable,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { useRouter } from "expo-router";
// import axios from "axios";
// import BASE_URL from "@/utils/config";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Feather } from "@expo/vector-icons"; 

// export default function LoginPage() {
//   const router = useRouter();
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false); // For toggling password

//   const handleLogin = async () => {
//     if (!username || !password) {
//       Alert.alert("Error", "Please enter username and password");
//       return;
//     }

//     try {
//       setLoading(true);
//       console.log("url:", BASE_URL);
//       const res = await axios.post(
//         `${BASE_URL}/auth/login`,
//         { UserName: username, Password: password },
//         {
//           withCredentials: true,
//         }
//       );

//       const { role, token } = res.data;

//       if (!token) {
//         Alert.alert("Login Failed", "No token returned from server");
//         return;
//       }

//       await AsyncStorage.setItem("token", token);

//       // Navigate based on role
//       if (role === "dispacher") router.push("/taxiDispacher");
//       else Alert.alert("Error", "Unknown role!");
//     } catch (err: any) {
//       console.error(err);
//       Alert.alert(
//         "Login Failed",
//         err.response?.data?.message || "Something went wrong"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.login}>
//       <View style={styles.container}>
//         <Text style={styles.title}>LOGIN PAGE</Text>

//         <TextInput
//           style={styles.input}
//           placeholder="Username"
//           value={username}
//           onChangeText={setUsername}
//         />

//         <View style={styles.passwordContainer}>
//           <TextInput
//             style={[styles.input, { flex: 1 }]}
//             placeholder="Password"
//             secureTextEntry={!showPassword}
//             value={password}
//             onChangeText={setPassword}
//           />
//           <TouchableOpacity
//             onPress={() => setShowPassword(!showPassword)}
//             style={styles.eyeIcon}
//           >
//             <Feather
//               name={showPassword ? "eye" : "eye-off"}
//               size={20}
//               color="#4169e1"
//             />
//           </TouchableOpacity>
//         </View>

//         <Pressable
//           style={({ pressed }) => [
//             styles.button,
//             pressed && { backgroundColor: "#005BBB" },
//           ]}
//           onPress={handleLogin}
//           disabled={loading}
//         >
//           <Text style={styles.buttonText}>
//             {loading ? "Logging in..." : "Log In"}
//           </Text>
//         </Pressable>

//         <TouchableOpacity>
//           <Text style={styles.linkText}>Forgot password?</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   login: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f0f4f8",
//     paddingHorizontal: 20,
//   },
//   container: {
//     width: "100%",
//     maxWidth: 400,
//     backgroundColor: "#ffffff",
//     borderRadius: 20,
//     paddingVertical: 40,
//     paddingHorizontal: 30,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: "700",
//     color: "#4169e1",
//     textAlign: "center",
//     marginBottom: 30,
//   },
//   input: {
//     borderColor: "#4169e1",
//     borderWidth: 2,
//     borderRadius: 25,
//     fontSize: 18,
//     height: 50,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     color: "#000",
//   },
//   passwordContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   eyeIcon: {
//     position: "absolute",
//     right: 15,
//     padding: 5,
//   },
//   button: {
//     width: "100%",
//     height: 50,
//     backgroundColor: "#4169e1",
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//   },
//   linkText: {
//     color: "#4169e1",
//     textAlign: "center",
//     marginTop: 15,
//     fontSize: 16,
//   },
// });

import BASE_URL from "@/utils/config";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const [isFocused, setIsFocused] = useState({ username: false, password: false });

  React.useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      })
    ]).start();
  }, []);

 

 const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        UserName: username,
        Password: password,
      });

      const { token, role, userId, mustChangePassword } = res.data;

      if (!token || !userId) {
        Alert.alert('Login Failed', 'Invalid login response');
        return;
      }

      // Store session
      await AsyncStorage.multiSet([
        ['token', token],
        ['id', userId.toString()],
        ['role', role],
        ['mustChangePassword', String(mustChangePassword)],
      ]);

      // Dispatcher flow
      if (role === 'dispacher') {
        if (mustChangePassword) {
          router.replace('/changePassword');
        } else {
          router.replace('/taxiDispacher');
        }
      } else {
        Alert.alert('Error', 'Unauthorized role');
      }
    } catch (err: any) {
      console.error('Login Error:', err.response?.data || err.message);
      Alert.alert(
        'Login Failed',
        err.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.login}>
      {/* Decorative Background Elements */}
      <View style={styles.decorationTopLeft} />
      <View style={styles.decorationBottomRight} />
      <View style={styles.circleDecoration} />
      
      {/* Animated Login Container */}
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Logo Header */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Feather name="shield" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>TAXI DISPATCH</Text>
          <Text style={styles.brandSubtitle}>Professional Transport Management</Text>
        </View>

        <Text style={styles.title}>Secure Access Portal</Text>

        {/* Username Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconContainer}>
            <Feather 
              name="user" 
              size={20} 
              color={isFocused.username ? "#4169e1" : "#94A3B8"} 
            />
          </View>
          <TextInput
            style={[
              styles.input,
              isFocused.username && styles.inputFocused
            ]}
            placeholder="Enter your username"
            placeholderTextColor="#94A3B8"
            value={username}
            onChangeText={setUsername}
            onFocus={() => setIsFocused({...isFocused, username: true})}
            onBlur={() => setIsFocused({...isFocused, username: false})}
            editable={!loading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIconContainer}>
            <Feather 
              name="lock" 
              size={20} 
              color={isFocused.password ? "#4169e1" : "#94A3B8"} 
            />
          </View>
          <TextInput
            style={[
              styles.input,
              isFocused.password && styles.inputFocused
            ]}
            placeholder="Enter your password"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setIsFocused({...isFocused, password: true})}
            onBlur={() => setIsFocused({...isFocused, password: false})}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            disabled={loading}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color={isFocused.password ? "#4169e1" : "#94A3B8"}
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner} />
              <Text style={styles.buttonText}>Authenticating...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.buttonText}>Sign In</Text>
              <Feather name="arrow-right" size={20} color="#FFFFFF" style={styles.buttonArrow} />
            </>
          )}
        </Pressable>

        {/* Forgot Password */}
        {/* <TouchableOpacity style={styles.forgotContainer} disabled={loading}>
          <Feather name="key" size={16} color="#4169e1" />
          <Text style={styles.linkText}>Forgot password?</Text>
        </TouchableOpacity> */}

        {/* Security Info */}
       

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Taxi Dispatch System. v2.4
          </Text>
          <View style={styles.footerDot} />
          <Text style={styles.footerText}>All rights reserved</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  login: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  decorationTopLeft: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(65, 105, 225, 0.05)',
  },
  decorationBottomRight: {
    position: 'absolute',
    bottom: -150,
    right: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(65, 105, 225, 0.03)',
  },
  circleDecoration: {
    position: 'absolute',
    top: '30%',
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(65, 105, 225, 0.02)',
  },
  container: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 48,
    paddingHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { 
      width: 0, 
      height: 20 
    },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4169e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4169e1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    height: 56,
    paddingHorizontal: 16,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    paddingVertical: 0,
    height: '100%',
  },
  inputFocused: {
    borderColor: '#4169e1',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  button: {
    width: "100%",
    height: 56,
    backgroundColor: "#4169e1",
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#4169e1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonPressed: {
    backgroundColor: "#3155B0",
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: "#94A3B8",
    shadowColor: '#94A3B8',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    marginRight: 10,
    // animationKeyframes: {
    //   '0%': { transform: [{ rotate: '0deg' }] },
    //   '100%': { transform: [{ rotate: '360deg' }] },
    // },
    animationDuration: '1s',
    animationIterationCount: 'infinite',
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonArrow: {
    marginLeft: 10,
  },
  forgotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  linkText: {
    color: "#4169e1",
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  securityText: {
    color: '#0C4A6E',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 20,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 12,
  },
});