import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000';

const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/user/login`, {
      email,
      password,
    });

    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      setupAxiosInterceptors();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const register = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/user/register`, {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
};

const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

setupAxiosInterceptors();

export { login, register, logout, isAuthenticated };