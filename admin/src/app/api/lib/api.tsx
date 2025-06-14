import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/auth/register', userData),
  getProfile: () =>
    api.get('/auth/profile'),
};

export const userAPI = {
  getUsers: () =>
    api.get('/users'),
  getUser: (id: string) =>
    api.get(`/users/${id}`),
  createUser: (userData: any) =>
    api.post('/users', userData),
  updateUser: (id: string, userData: any) =>
    api.patch(`/users/${id}`, userData),
  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
};

export const adminAPI = {
  getAdmins: () =>
    api.get('/admin'),
  getAdmin: (id: string) =>
    api.get(`/admin/${id}`),
  createAdmin: (adminData: any) =>
    api.post('/admin', adminData),
  updateAdmin: (id: string, adminData: any) =>
    api.patch(`/admin/${id}`, adminData),
  deleteAdmin: (id: string) =>
    api.delete(`/admin/${id}`),
};

export default api;