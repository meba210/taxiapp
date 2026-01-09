import BASE_URL from '@/utils/config';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const ChangePasswordScreen = () => {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggleShowPassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/(?=.*[a-z])/.test(newPassword)) {
      newErrors.newPassword =
        'Password must contain at least one lowercase letter';
      isValid = false;
    } else if (!/(?=.*[A-Z])/.test(newPassword)) {
      newErrors.newPassword =
        'Password must contain at least one uppercase letter';
      isValid = false;
    } else if (!/(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
      isValid = false;
    } else if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
      newErrors.newPassword =
        'Password must contain at least one special character';
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword =
        'New password must be different from current password';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const clearError = (field: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const id = await AsyncStorage.getItem('id');
      const token = await AsyncStorage.getItem('token');

      if (!id || !token) {
        Alert.alert('Session expired', 'Please login again');
        router.replace('/(tabs)/profile');
        return;
      }

      const response = await axios.put(
        `${BASE_URL}/dispachers/${id}/changePassword`,
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        await AsyncStorage.setItem('mustChangePassword', 'false');
        Alert.alert('Success', 'Password updated successfully!', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/taxiDispacher'),
          },
        ]);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to update password';
      Alert.alert('Error', message);
      console.error(
        'Change Password Error:',
        error?.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordFields = [
    {
      label: 'Current Password',
      value: currentPassword,
      setter: setCurrentPassword,
      key: 'current',
      error: errors.currentPassword,
    },
    {
      label: 'New Password',
      value: newPassword,
      setter: setNewPassword,
      key: 'new',
      error: errors.newPassword,
    },
    {
      label: 'Confirm Password',
      value: confirmPassword,
      setter: setConfirmPassword,
      key: 'confirm',
      error: errors.confirmPassword,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/profile')}
            style={styles.backButton}
            disabled={loading}
          >
            <Feather
              name="arrow-left"
              size={responsiveSize(24)}
              color="#4169e1"
            />
          </TouchableOpacity>
          <Text style={styles.title}>Change Password</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Enter your details to update your password
          </Text>

          {passwordFields.map((item) => (
            <View key={item.key} style={styles.inputContainer}>
              <Text style={styles.label}>{item.label}</Text>

              <View
                style={[
                  styles.passwordWrapper,
                  item.error ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={item.value}
                  onChangeText={(text) => {
                    item.setter(text);
                    clearError(item.key as keyof typeof errors);
                  }}
                  secureTextEntry={
                    !showPassword[item.key as keyof typeof showPassword]
                  }
                  placeholder={`Enter ${item.label.toLowerCase()}`}
                  editable={!loading}
                  placeholderTextColor="#94A3B8"
                  onBlur={() => {
                    if (item.key === 'new' && newPassword) {
                      validateForm();
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => toggleShowPassword(item.key as any)}
                  disabled={loading}
                >
                  <Feather
                    name={
                      showPassword[item.key as keyof typeof showPassword]
                        ? 'eye'
                        : 'eye-off'
                    }
                    size={responsiveSize(20)}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              {item.error ? (
                <Text style={styles.errorText}>{item.error}</Text>
              ) : (
                item.key === 'new' &&
                newPassword.length > 0 && (
                  <View style={styles.validationContainer}>
                    <Text
                      style={[
                        styles.validationText,
                        newPassword.length >= 8 ? styles.valid : styles.invalid,
                      ]}
                    >
                      ✓ At least 8 characters
                    </Text>
                    <Text
                      style={[
                        styles.validationText,
                        /(?=.*[a-z])/.test(newPassword)
                          ? styles.valid
                          : styles.invalid,
                      ]}
                    >
                      ✓ One lowercase letter
                    </Text>
                    <Text
                      style={[
                        styles.validationText,
                        /(?=.*[A-Z])/.test(newPassword)
                          ? styles.valid
                          : styles.invalid,
                      ]}
                    >
                      ✓ One uppercase letter
                    </Text>
                    <Text
                      style={[
                        styles.validationText,
                        /(?=.*\d)/.test(newPassword)
                          ? styles.valid
                          : styles.invalid,
                      ]}
                    >
                      ✓ One number
                    </Text>
                    <Text
                      style={[
                        styles.validationText,
                        /(?=.*[@$!%*?&])/.test(newPassword)
                          ? styles.valid
                          : styles.invalid,
                      ]}
                    >
                      ✓ One special character
                    </Text>
                  </View>
                )
              )}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const responsiveSize = (size: number) => {
  const scale = width / 375;
  return Math.ceil(size * Math.min(scale, 1.5));
};

const responsivePadding = () => {
  if (width < 375) return 15;
  if (width > 414) return 30;
  return 25;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSize(20),
    paddingTop:
      Platform.OS === 'android' ? responsiveSize(40) : responsiveSize(20),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: responsiveSize(5),
  },
  title: {
    fontSize: responsiveSize(20),
    fontWeight: 'bold',
    color: '#4169e1',
    marginLeft: responsiveSize(15),
  },
  content: {
    padding: responsivePadding(),
    paddingBottom: responsiveSize(40),
  },
  subtitle: {
    fontSize: responsiveSize(14),
    color: '#666',
    marginBottom: responsiveSize(25),
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: responsiveSize(20),
  },
  label: {
    fontSize: responsiveSize(14),
    fontWeight: '600',
    color: '#4169e1',
    marginBottom: responsiveSize(8),
  },
  passwordWrapper: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: responsiveSize(8),
  },
  input: {
    padding: responsiveSize(12),
    paddingRight: responsiveSize(45),
    fontSize: responsiveSize(16),
  },
  inputError: {
    borderColor: '#ef4444',
  },
  eyeButton: {
    position: 'absolute',
    right: responsiveSize(12),
    top: responsiveSize(12),
  },
  errorText: {
    color: '#ef4444',
    fontSize: responsiveSize(12),
    marginTop: responsiveSize(5),
  },
  validationContainer: {
    marginTop: responsiveSize(10),
  },
  validationText: {
    fontSize: responsiveSize(12),
    marginBottom: responsiveSize(2),
  },
  valid: {
    color: '#10b981',
  },
  invalid: {
    color: '#94a3b8',
  },
  button: {
    backgroundColor: '#4169e1',
    borderRadius: responsiveSize(8),
    padding: responsiveSize(15),
    alignItems: 'center',
    marginTop: responsiveSize(10),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: responsiveSize(16),
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
