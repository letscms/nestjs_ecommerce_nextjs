import {userAPI} from '@/lib/api';
export const userEndpoint = {
  login: async (email: string, password: string) => {
    // console.log('User login called with:', { email, password });
    // const response = await userAPI.post('/auth/user/login', { email, password });
    // console.log('User login response:', response);
    try {
      const response = await userAPI.post('/auth/user/login', { email, password });
      // console.log('User login response:', response);
      return response.data;
    } catch (error) {
      // console.error('Error during user login:', error);
      throw error;
    }
  },
  getProfile: async () => {
    try {
      const response = await userAPI.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
}

// export const adminAuthAPI = {
//   login: async (email: string, password: string) => {
//     const response = await adminAPI.post('/auth/admin/login', { email, password });
//     return response.data;
//   },
  
//   getProfile: async () => {
//     const response = await adminAPI.get('/auth/profile');
//     return response.data;
//   },
  
//   refreshToken: async () => {
//     const response = await adminAPI.post('/auth/admin/refresh');
//     return response.data;
//   },
// };
// // User Authentication API
// export const userAuthAPI = {
//   login: async (email: string, password: string) => {
//     const response = await userAPI.post('/auth/user/login', { email, password });
//     return response.data;
//   },
  
//   register: async (userData: any) => {
//     const response = await userAPI.post('/auth/register', userData);
//     return response.data;
//   },
  
//   getProfile: async () => {
//     const response = await userAPI.get('/auth/profile');
//     return response.data;
//   },
  
//   refreshToken: async () => {
//     const response = await userAPI.post('/auth/user/refresh');
//     return response.data;
//   },
// };
// // Users Management API (Admin only)
// export const usersAPI = {
//   getAll: async () => {
//     const response = await adminAPI.get('/users');
//     return response.data;
//   },
  
//   getById: async (id: string) => {
//     const response = await adminAPI.get(`/users/${id}`);
//     return response.data;
//   },
  
//   create: async (userData: any) => {
//     const response = await adminAPI.post('/users', userData);
//     return response.data;
//   },
  
//   update: async (id: string, userData: any) => {
//     const response = await adminAPI.patch(`/users/${id}`, userData);
//     return response.data;
//   },
  
//   delete: async (id: string) => {
//     const response = await adminAPI.delete(`/users/${id}`);
//     return response.data;
//   },
// };

// // Admins Management API (Super Admin only)
// export const adminsAPI = {
//   getAll: async () => {
//     const response = await adminAPI.get('/admins');
//     return response.data;
//   },
  
//   getById: async (id: string) => {
//     const response = await adminAPI.get(`/admins/${id}`);
//     return response.data;
//   },
  
//   create: async (adminData: any) => {
//     const response = await adminAPI.post('/admins', adminData);
//     return response.data;
//   },
  
//   update: async (id: string, adminData: any) => {
//     const response = await adminAPI.patch(`/admins/${id}`, adminData);
//     return response.data;
//   },
  
//   delete: async (id: string) => {
//     const response = await adminAPI.delete(`/admins/${id}`);
//     return response.data;
//   },
// };

// // Products API (accessible by both with different permissions)
// export const productsAPI = {
//   // User endpoints
//   getAllPublic: async () => {
//     const response = await userAPI.get('/products/public');
//     return response.data;
//   },
  
//   getByIdPublic: async (id: string) => {
//     const response = await userAPI.get(`/products/public/${id}`);
//     return response.data;
//   },
  
//   // Admin endpoints
//   getAll: async () => {
//     const response = await adminAPI.get('/products');
//     return response.data;
//   },
  
//   getById: async (id: string) => {
//     const response = await adminAPI.get(`/products/${id}`);
//     return response.data;
//   },
  
//   create: async (productData: any) => {
//     const response = await adminAPI.post('/products', productData);
//     return response.data;
//   },
  
//   update: async (id: string, productData: any) => {
//     const response = await adminAPI.patch(`/products/${id}`, productData);
//     return response.data;
//   },
  
//   delete: async (id: string) => {
//     const response = await adminAPI.delete(`/products/${id}`);
//     return response.data;
//   },
// };