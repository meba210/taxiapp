import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const taxiX = useRef(new Animated.Value(-screenWidth)).current;

  useEffect(() => {
    requestAnimationFrame(() => {
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 110,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(taxiX, {
            toValue: screenWidth * 1.4,
            duration: 1800,
            easing: Easing.linear,
            useNativeDriver: true,
          }).start(() => {
            router.replace('/(tabs)/profile');
          });
        }, 500);
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('@/assets/images/taxi3.png')}
        resizeMode="contain"
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      />

      <Animated.Image
        source={require('@/assets/images/taxi2.png')}
        resizeMode="contain"
        style={[
          styles.taxi,
          {
            transform: [{ translateX: taxiX }, { rotate: '5deg' }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    overflow: 'hidden',
  },
  logo: {
    width: Math.min(screenWidth * 0.8, 400),
    height: Math.min(screenHeight * 0.4, 400),
    marginBottom: screenHeight * 0.05,
  },
  taxi: {
    width: Math.min(screenWidth * 0.5, 250),
    height: Math.min(screenHeight * 0.25, 250),
    position: 'absolute',
    bottom: screenHeight * 0.15,
    left: 0,
  },
});
