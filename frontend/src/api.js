import axios from 'axios';

// Use environment variable for the API base URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getTransactions = () => api.get('/transactions');
export const addTransaction = (txn) => api.post('/transactions', txn);
export const updateTransaction = (id, txn) => api.put(`/transactions/${id}`, txn);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const addCategory = (category) => api.post('/auth/categories', { category });

export default api;
