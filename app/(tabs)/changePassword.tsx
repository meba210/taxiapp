import BASE_URL from '@/utils/config';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const ChangePasswordScreen = () => {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggleShowPassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const id = await AsyncStorage.getItem('id');
      const token = await AsyncStorage.getItem('token');

      if (!id || !token) {
        Alert.alert('Session expired', 'Please login again');
        router.replace('/profile');
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
          { text: 'OK', onPress: () => router.replace('/taxiDispacher') },
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#4169e1" />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Enter your details to update your password
        </Text>

        {[
          { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, key: 'current' },
          { label: 'New Password', value: newPassword, setter: setNewPassword, key: 'new' },
          { label: 'Confirm Password', value: confirmPassword, setter: setConfirmPassword, key: 'confirm' },
        ].map(item => (
          <View key={item.key} style={styles.inputContainer}>
            <Text style={styles.label}>{item.label}</Text>

            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                value={item.value}
                onChangeText={item.setter}
                secureTextEntry={!showPassword[item.key as keyof typeof showPassword]}
                placeholder={`Enter ${item.label.toLowerCase()}`}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => toggleShowPassword(item.key as any)}
              >
                <Feather
                  name={
                    showPassword[item.key as keyof typeof showPassword]
                      ? 'eye'
                      : 'eye-off'
                  }
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
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
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { padding: 5 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#4169e1', marginLeft: 15 },
  content: { padding: 25 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 25, textAlign: 'center' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#4169e1', marginBottom: 8 },
  passwordWrapper: { position: 'relative' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, paddingRight: 45 },
  eyeButton: { position: 'absolute', right: 12, top: 12 },
  button: { backgroundColor: '#4169e1', borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});



