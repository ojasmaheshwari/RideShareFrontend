import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../api/axios';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'ROLE_USER' | 'ROLE_DRIVER';
}

interface JwtPayload {
    sub: string;
    role: string;
    name: string;
    exp: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        name: string;
        email: string;
        password: string;
        phone: string;
        role: 'ROLE_USER' | 'ROLE_DRIVER';
    }) => Promise<void>;
    logout: () => void;
    isPassenger: boolean;
    isDriver: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                const decoded = jwtDecode<JwtPayload>(savedToken);
                // Check if token is expired
                if (decoded.exp * 1000 > Date.now()) {
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));
                } else {
                    // Token expired, clear storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        const { token: newToken, user: userData } = response.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setToken(newToken);
        setUser(userData);
    };

    const register = async (data: {
        name: string;
        email: string;
        password: string;
        phone: string;
        role: 'ROLE_USER' | 'ROLE_DRIVER';
    }) => {
        await authApi.register(data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        isPassenger: user?.role === 'ROLE_USER',
        isDriver: user?.role === 'ROLE_DRIVER',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
