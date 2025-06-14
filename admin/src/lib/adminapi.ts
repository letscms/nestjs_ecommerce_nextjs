import {adminAPI} from './api';

export const adminEndpoint = {
    login: async (email: string, password: string) => {
    try {
      const response = await adminAPI.post('/auth/admin/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error during admin login:', error);
      throw error;
    }
  },
  getProfile: async () => {
    try {
      const response = await adminAPI.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      throw error;
    }
  },
//   getDashboardData: async () => {
//     try {
//       const response = await adminAPI.get('/dashboard');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       throw error;
//     }
//   }

}
  // Add more admin-specific API methods as needed