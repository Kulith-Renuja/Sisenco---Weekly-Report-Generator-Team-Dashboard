import axios from 'axios';

// Create an Axios instance with a default base URL
const api = axios.create({
  // Default to localhost:5000/api if the environment variable is not set
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach the JWT token
api.interceptors.request.use(
  (config) => {
    // Attempt to retrieve the stored user data
    const userString = localStorage.getItem('user');
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        // If the token exists, attach it to the Authorization header
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
      }
    }
    
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

export default api;
