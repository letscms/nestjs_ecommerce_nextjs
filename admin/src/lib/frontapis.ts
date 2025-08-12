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
  register: async (userData: any) => {
    try {
      const response = await userAPI.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error during user registration:', error);
      throw error;
    }
  }
};
