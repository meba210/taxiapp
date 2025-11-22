import React, { useEffect, useRef } from "react";
import { Animated, View, Image, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;

export default function SplashScreen() {
  const router = useRouter();
  const moveAnim = useRef(new Animated.Value(-200)).current; 
 const scaleAnim = useRef(new Animated.Value(0)).current;  
  const fadeAnim = useRef(new Animated.Value(0)).current; 
    const translateY = useRef(new Animated.Value(30)).current; 
 useEffect(() => {
    
     Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,       
        tension: 100,       
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -10,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setTimeout(() => {
      Animated.timing(moveAnim, {
        toValue: screenWidth,
        duration: 5000,
        useNativeDriver: true,
      }).start(() => {
      
        router.replace("/(tabs)/profile");
      });
    }, 2000);
  }, []);


  return (
    <View style={styles.container}>
       <Animated.Image
        source={require("@/assets/images/taxi3.png")}
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: translateY },
            ],
          },
        ]}
      />
      <Animated.Image
        source={require("@/assets/images/taxi2.png")}
        style={[styles.taxi, { transform: [{ translateX: moveAnim }, { rotate: "5deg" }]
}]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 30,
  },
  taxi: {
       width: 200, 
    height: 200, 
    resizeMode: "contain",
    position: "absolute",
    bottom: 100,
  },
});
