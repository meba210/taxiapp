
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'          
  : 'http://192.168.7.122:5000';     

export default BASE_URL;
