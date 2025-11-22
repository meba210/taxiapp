import { Image } from 'expo-image';
import { Button, Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import LoginPage from '@/components/ui/login';
import SplashScreen from '@/app/SplashScreen';
import React from 'react';

export default function HomeScreen() {
  return (
    <>
    <LoginPage/>
    <SplashScreen/>
   
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
