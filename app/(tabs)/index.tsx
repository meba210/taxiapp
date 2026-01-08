import SplashScreen from '@/app/SplashScreen';
import LoginPage from '@/components/ui/login';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <>
      <LoginPage />
      <SplashScreen />
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
