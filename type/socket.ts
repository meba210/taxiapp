import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';

// // export const socket = io(BASE_URL, {
// //   transports: ['websocket'],
// //   autoConnect: false,
// // });

export const socket = io(`http://192.168.1.9:5000`, {
  transports: ['polling', 'websocket'],
  autoConnect: true,
});

export const connectSocket = async (route: string) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) return;

  // Set auth before connecting
  socket.auth = { token };

  // Listen for connect once
  socket.once('connect', () => {
    console.log('🟢 Socket connected:', socket.id);
    socket.emit('joinRoute', route);
  });

  // Optional: listen for disconnect
  socket.on('disconnect', (reason) => {
    console.log('🔴 Socket disconnected:', reason);
  });

  socket.connect();
};
