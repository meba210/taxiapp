
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'          // Always a string
  : 'http://192.168.8.160:5000';     // Always a string

export default BASE_URL;
