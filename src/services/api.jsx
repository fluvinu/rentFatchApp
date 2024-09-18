// src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'https://rent-jr48.onrender.com';

// Orders API
export const getAllOrders = () => axios.get(`${API_BASE_URL}/ord/`);
export const getOrderById = (id) => axios.get(`${API_BASE_URL}/ord/${id}`);
export const createOrder = (vehicleId, customerId) => axios.post(`${API_BASE_URL}/ord/${vehicleId}/${customerId}`);
export const updateOrder = (id, data) => axios.put(`${API_BASE_URL}/ord/${id}`, data);
export const deleteOrder = (id) => axios.delete(`${API_BASE_URL}/ord/${id}`);

// Vehicles API
export const getAllVehicles = () => axios.get(`${API_BASE_URL}/veh`);
export const getVehicleById = (id) => axios.get(`${API_BASE_URL}/veh/${id}`);
export const createVehicle = (data) => axios.post(`${API_BASE_URL}/veh`, data);
export const updateVehicle = (id, data) => axios.put(`${API_BASE_URL}/veh/${id}`, data);
export const deleteVehicle = (id) => axios.delete(`${API_BASE_URL}/veh/${id}`);

// Customers API
export const getAllCustomers = () => axios.get(`${API_BASE_URL}/cus/`);
export const getCustomerById = (id) => axios.get(`${API_BASE_URL}/cus/${id}`);
export const createCustomer = (data) => axios.post(`${API_BASE_URL}/cus`, data);
export const updateCustomer = (id, data) => axios.put(`${API_BASE_URL}/cus/${id}`, data);
export const deleteCustomer = (id) => axios.delete(`${API_BASE_URL}/cus/${id}`);
