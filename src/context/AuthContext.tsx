import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../lib/api'; // Adjust the import path if your api.ts is elsewhere

interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: any) => Promise<void>;
    register: (credentials: any) => Promise<void>; // 👈 Added register
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('thinksy_token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                // Assume token is valid for now, but you could fetch the user profile here
                setUser({ id: 'user-id', email: 'user@example.com' }); // Placeholder until a /me route exists
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, [token]);

    const login = async (credentials: any) => {
        const data = await authApi.login(credentials);
        localStorage.setItem('thinksy_token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    // 👈 New register function
    const register = async (credentials: any) => {
        const data = await authApi.register(credentials);
        localStorage.setItem('thinksy_token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('thinksy_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};