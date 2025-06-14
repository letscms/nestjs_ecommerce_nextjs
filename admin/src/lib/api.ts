import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create separate axios instances for admin and user
const adminAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const userAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Admin API interceptors
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// User API interceptors
userAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

userAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('User API error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('user_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// // Auth API
// export const authAPI = {
//   login: async (email: string, password: string) => {
//     const response = await api.post('/auth/login', { email, password });
//     return response.data;
//   },
  
//   register: async (userData: any) => {
//     const response = await api.post('/auth/register', userData);
//     return response.data;
//   },
  
//   getProfile: async () => {
//     const response = await api.get('/auth/profile');
//     return response.data;
//   },
  
//   refreshToken: async () => {
//     const response = await api.post('/auth/refresh');
//     return response.data;
//   },
// };

// // Users API
// export const usersAPI = {
//   getAll: async () => {
//     const response = await api.get('/users');
//     return response.data;
//   },
  
//   getById: async (id: string) => {
//     const response = await api.get(`/users/${id}`);
//     return response.data;
//   },
  
//   create: async (userData: any) => {
//     const response = await api.post('/users', userData);
//     return response.data;
//   },
  
//   update: async (id: string, userData: any) => {
//     const response = await api.patch(`/users/${id}`, userData);
//     return response.data;
//   },
  
//   delete: async (id: string) => {
//     const response = await api.delete(`/users/${id}`);
//     return response.data;
//   },
// };

// // Admins API
// export const adminsAPI = {
//   getAll: async () => {
//     const response = await api.get('/admins');
//     return response.data;
//   },
  
//   getById: async (id: string) => {
//     const response = await api.get(`/admins/${id}`);
//     return response.data;
//   },
  
//   create: async (adminData: any) => {
//     const response = await api.post('/admins', adminData);
//     return response.data;
//   },
  
//   update: async (id: string, adminData: any) => {
//     const response = await api.patch(`/admins/${id}`, adminData);
//     return response.data;
//   },
  
//   delete: async (id: string) => {
//     const response = await api.delete(`/admins/${id}`);
//     return response.data;
//   },
// };

export { adminAPI, userAPI };