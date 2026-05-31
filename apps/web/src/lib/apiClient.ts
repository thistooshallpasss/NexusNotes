import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_URL
});

if (typeof window !== 'undefined') {
  apiClient.interceptors.request.use((config) => {
    const passcode = localStorage.getItem('nexus_passcode');
    if (passcode) {
      config.headers['Authorization'] = `Bearer ${passcode}`;
    }
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('nexus_passcode');
        localStorage.setItem('session_expired', 'true');
        window.location.reload();
      }
      return Promise.reject(error);
    }
  );
}

export default apiClient;
