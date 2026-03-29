import axios from 'axios';

// Use environment variable for the API base URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const getTransactions = () => api.get('/transactions');
export const addTransaction = (txn) => api.post('/transactions', txn);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

export default api;
