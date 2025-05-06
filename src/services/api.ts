
import axios, { AxiosRequestConfig } from "axios";
import { toast } from "sonner";

// Base API URL
const API_URL = "http://localhost:3000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = 
      error.response?.data?.message ||
      "Ha ocurrido un error. Por favor intente de nuevo.";
    
    toast.error(message);
    
    // If 401 unauthorized, redirect to login
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

// Define our API service functions
const apiService = {
  // Auth services
  auth: {
    login: async (email: string, password: string) => {
      try {
        const response = await api.post("/auth/signin", { email, password });
        
        // Extract data from response
        const { token, ...userData } = response.data;
        
        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        return { token, user: userData };
      } catch (error) {
        throw error;
      }
    },
    
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    
    changePassword: async (currentPassword: string, newPassword: string) => {
      try {
        const response = await api.post("/auth/change-password", {
          currentPassword,
          newPassword
        });
        
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    checkAuth: () => {
      const token = localStorage.getItem("token");
      return !!token;
    }
  },
  
  // User services
  users: {
    getAllUsers: async () => {
      try {
        const response = await api.get("/users");
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    getUserById: async (id: number) => {
      try {
        const response = await api.get(`/users/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },
  
  // Attendance services
  attendance: {
    getAttendanceList: async (filters = {}) => {
      try {
        const response = await api.get("/attendances", { params: filters });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    createAttendance: async (attendanceData: any) => {
      try {
        const response = await api.post("/attendances", attendanceData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    updateAttendance: async (id: number, attendanceData: any) => {
      try {
        const response = await api.put(`/attendances/${id}`, attendanceData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    deleteAttendance: async (id: number) => {
      try {
        const response = await api.delete(`/attendances/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    getAttendancesByDateRange: async (startDate: string, endDate: string, nombres?: string, cedula?: string) => {
      try {
        // Crear las fechas correctamente en la zona horaria local
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        
        // Convertir a ISO string manteniendo la zona horaria local
        const startISO = start.toISOString();
        const endISO = end.toISOString();
        
        console.log("Fechas enviadas al backend:", { startISO, endISO });
        
        const response = await api.get("/attendances/range", {
          params: {
            startDate: startISO,
            endDate: endISO,
            nombres,
            cedula
          }
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }
};

export default apiService;
