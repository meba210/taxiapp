import BASE_URL from '@/utils/config';
import axios from 'axios';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export default api;
