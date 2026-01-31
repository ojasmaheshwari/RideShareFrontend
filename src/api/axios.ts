import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
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

// Response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth API calls
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/api/auth/login', { email, password }),

    register: (data: {
        name: string;
        email: string;
        password: string;
        phone: string;
        role: 'ROLE_USER' | 'ROLE_DRIVER';
    }) => api.post('/api/auth/register', data),
};

// Rides API calls
export const ridesApi = {
    // Passenger endpoints
    createRide: (pickupLocation: string, dropoffLocation: string) =>
        api.post('/api/rides', { pickupLocation, dropoffLocation }),

    getPassengerActiveRides: () =>
        api.get('/api/rides/passenger/active'),

    getPassengerHistory: (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') =>
        api.get(`/api/rides/passenger/history?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),

    // Driver endpoints
    getAvailableRides: (page = 0, size = 10) =>
        api.get(`/api/rides/driver/available?page=${page}&size=${size}`),

    acceptRide: (rideId: string) =>
        api.put(`/api/rides/${rideId}/accept`),

    completeRide: (rideId: string) =>
        api.put(`/api/rides/${rideId}/complete`),

    getDriverActiveRides: () =>
        api.get('/api/rides/driver/active'),

    getDriverHistory: (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') =>
        api.get(`/api/rides/driver/history?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
};

// Payment API calls
export const paymentApi = {
    processPayment: (data: {
        rideId: string;
        amount: number;
        paymentMethod: string;
    }) => api.post('/api/v1/payments', data),

    getPaymentHistory: (page = 0, size = 10) =>
        api.get(`/api/v1/payments/my?page=${page}&size=${size}`),
};
