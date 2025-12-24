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


// import React, { useEffect, useRef, useState } from "react";
// import {
//   Animated,
//   View,
//   Image,
//   StyleSheet,
//   Dimensions,
//   Platform,
//   Text,
//   Easing,
// } from "react-native";
// import { useRouter } from "expo-router";

// // Responsive dimensions
// const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
// const isWeb = Platform.OS === "web";

// // Web-specific styling
// const webStyles = isWeb ? {
//   container: {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 9999,
//     backgroundColor: '#FFFFFF',
//   },
//   webContent: {
//     width: '100%',
//     height: '100%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   }
// } : {};

// export default function SplashScreen() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(true);
//   const [isVisible, setIsVisible] = useState(true);
  
//   // Animation refs
//   const moveAnim = useRef(new Animated.Value(-200)).current; 
//   const scaleAnim = useRef(new Animated.Value(0)).current;  
//   const fadeAnim = useRef(new Animated.Value(0)).current; 
  
//   // Responsive values
//   const logoSize = isWeb 
//     ? Math.min(screenWidth * 0.25, 300)
//     : Math.min(screenWidth * 0.6, 300);
  
//   const taxiSize = isWeb 
//     ? Math.min(screenWidth * 0.2, 200)
//     : Math.min(screenWidth * 0.4, 200);

//   useEffect(() => {
//     if (!isVisible) return;

//     // Logo animation
//     Animated.parallel([
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 3,
//         tension: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Taxi movement after delay - SLOWER on web
//     setTimeout(() => {
//       setIsLoading(false);
      
//       // Web: Much slower movement for better visibility
//       const taxiDuration = isWeb ? 7000 : 5000;
      
//       Animated.timing(moveAnim, {
//         toValue: screenWidth + 300,
//         duration: taxiDuration,
//         useNativeDriver: true,
//         easing: Easing.inOut(Easing.cubic),
//       }).start(() => {
//         setIsVisible(false);
//         router.replace("/(tabs)/profile");
//       });
//     }, 2000);
//   }, [isVisible]);

//   if (!isVisible) {
//     return null;
//   }

//   // Web-specific render
//   if (isWeb) {
//     return (
//       <div style={webStyles.container}>
//         <div style={webStyles.webContent}>
//           {/* Logo */}
//           <div style={{
//             position: 'relative',
//             marginBottom: '30px',
//             opacity: fadeAnim,
//             transform: `scale(${scaleAnim})`,
//             transition: 'opacity 0.8s ease, transform 0.8s ease',
//           }}>
//             <img 
//               src={require("@/assets/images/taxi3.png")}
//               style={{
//                 width: `${logoSize}px`,
//                 height: `${logoSize}px`,
//                 objectFit: 'contain',
//                 filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
//               }}
//               alt="Logo"
//             />
//           </div>
          
//           {/* Loading Text */}
//           <div style={{
//             opacity: fadeAnim,
//             marginBottom: '20px',
//             fontSize: '20px',
//             color: '#2D3436',
//             fontWeight: '500',
//             fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//             transition: 'opacity 0.8s ease',
//           }}>
//             Loading...
//           </div>
          
//           {/* Loading Bar */}
//           <div style={{
//             width: `${Math.min(screenWidth * 0.5, 400)}px`,
//             marginTop: '10px',
//           }}>
//             <div style={{
//               width: '100%',
//               height: '6px',
//               backgroundColor: '#E0E0E0',
//               borderRadius: '3px',
//               overflow: 'hidden',
//             }}>
//               <div style={{
//                 height: '100%',
//                 width: isLoading ? '0%' : '100%',
//                 backgroundColor: '#FF6B35',
//                 borderRadius: '3px',
//                 transition: 'width 1s ease',
//               }} />
//             </div>
//           </div>
          
//           {/* Moving Taxi */}
//           <img 
//             src={require("@/assets/images/taxi2.png")}
//             style={{
//               position: 'absolute',
//               bottom: '60px',
//               width: `${taxiSize}px`,
//               height: `${taxiSize}px`,
//               objectFit: 'contain',
//               transform: `translateX(${moveAnim}px) rotate(15deg)`,
//               transition: 'transform 7s cubic-bezier(0.4, 0, 0.2, 1)',
//               filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.2))',
//             }}
//             alt="Taxi"
//           />
          
//           {/* Hint Text */}
//           <div style={{
//             position: 'absolute',
//             bottom: '40px',
//             fontSize: '14px',
//             color: '#636E72',
//             fontStyle: 'italic',
//             opacity: fadeAnim,
//             transition: 'opacity 0.8s ease',
//           }}>
//             Welcome to our app
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Mobile render (original)
//   return (
//     <View style={[styles.container, isWeb && webStyles.container]}>
//       {/* Logo */}
//       <Animated.Image
//         source={require("@/assets/images/taxi3.png")}
//         style={[
//           styles.logo,
//           {
//             width: logoSize,
//             height: logoSize,
//             opacity: fadeAnim,
//             transform: [{ scale: scaleAnim }],
//           },
//         ]}
//         resizeMode="contain"
//       />
      
//       {/* Loading Text */}
//       <Animated.Text style={[
//         styles.loadingText,
//         {
//           opacity: fadeAnim,
//           fontSize: 16,
//         }
//       ]}>
//         Loading...
//       </Animated.Text>
      
//       {/* Loading Bar */}
//       <View style={[styles.loadingBarContainer, { width: Math.min(screenWidth * 0.6, 350) }]}>
//         <View style={styles.loadingBarBackground}>
//           <Animated.View style={[
//             styles.loadingBarFill,
//             { 
//               width: isLoading ? '0%' : '100%',
//             }
//           ]} />
//         </View>
//       </View>
      
//       {/* Moving Taxi */}
//       <Animated.Image
//         source={require("@/assets/images/taxi2.png")}
//         style={[
//           styles.taxi,
//           {
//             width: taxiSize,
//             height: taxiSize,
//             transform: [
//               { translateX: moveAnim },
//               { rotate: "15deg" },
//             ],
//           },
//         ]}
//         resizeMode="contain"
//       />
      
//       {/* Hint Text */}
//       <Animated.Text style={[
//         styles.hintText,
//         { 
//           opacity: fadeAnim,
//           bottom: 30,
//         }
//       ]}>
//         Get ready
//       </Animated.Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     alignItems: "center",
//     justifyContent: "center",
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 9999,
//   },
//   logo: {
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   taxi: {
//     position: "absolute",
//     bottom: 80,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 4,
//       height: 4,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   loadingText: {
//     fontWeight: '500',
//     color: '#2D3436',
//     marginBottom: 15,
//     textAlign: 'center',
//     fontFamily: 'System',
//   },
//   loadingBarContainer: {
//     marginTop: 10,
//   },
//   loadingBarBackground: {
//     width: '100%',
//     height: 4,
//     backgroundColor: '#E0E0E0',
//     borderRadius: 2,
//     overflow: 'hidden',
//   },
//   loadingBarFill: {
//     height: '100%',
//     backgroundColor: '#FF6B35',
//     borderRadius: 2,
//   },
//   hintText: {
//     position: 'absolute',
//     color: '#636E72',
//     fontStyle: 'italic',
//     fontSize: 12,
//   },
// });