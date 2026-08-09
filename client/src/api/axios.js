import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('ledgerxUser') || '{}');
    const token = storedUser?.token;
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  } catch (err) {
    // ignore malformed localStorage entries
  }

  return config;
});

export default axiosInstance;
