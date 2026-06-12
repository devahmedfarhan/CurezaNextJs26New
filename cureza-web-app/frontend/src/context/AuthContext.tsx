'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { getStoredUser, setStoredUser, clearStoredUser } from '@/lib/auth-storage';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'customer' | 'vendor' | 'doctor' | 'admin' | 'super_admin';
    phone?: string;
    cart_count?: number;
    wishlist_count?: number;
    notifications_count?: number;
    wallet_balance?: number;
    profile_image?: string;
    profile_image_url?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
    mutate: () => void; // Expose mutate to manually refresh user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // 1. Initialize from LocalStorage (Instant Load)
    useEffect(() => {
        const storedUser = getStoredUser();
        let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        // SANITY CHECK: Check for corrupted token
        if (token && (token === '[object Object]' || token.includes('[object Object]'))) {
            console.warn('AuthContext: Found corrupted token in storage. Wiping it.');
            localStorage.removeItem('token');
            token = null;
        }

        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            if (storedUser) {
                setUser(storedUser);
                setIsLoading(false); // Show UI immediately
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    // 2. Background Fetch with SWR
    // Only fetch if we have a token in local state (or localStorage check)
    const [token, setToken] = useState<string | null>(typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    const { data: swrUser, error, mutate } = useSWR(token ? '/user' : null, fetcher, {
        shouldRetryOnError: false,
        revalidateOnFocus: true,
        onSuccess: (newData) => {
            setUser(newData);
            setStoredUser(newData); // Sync to storage
            setIsLoading(false);
        },
        onError: () => {
            // 401 handling is done in interceptor or effect below
        }
    });

    // Sync SWR error to logout if needed (optional, but good for validity)
    // Sync SWR error to logout if needed (optional, but good for validity)
    useEffect(() => {
        if (error) {
            const status = error.response?.status;

            // Only log non-401 errors as actual errors
            if (status !== 401) {
                console.error('SWR Error:', status, error.response?.data || error.message);
            }

            if (status === 401) {
                // If we are on the doctor registration page, DO NOT clear the token.
                // The registration flow needs to manage its own "pseudo-authenticated" state.
                if (typeof window !== 'undefined' && window.location.pathname.includes('/doctor/register')) {
                    console.log('AuthContext: Ignoring 401 on doctor registration page to preserve onboarding session.');
                    return;
                }

                // Handle 401 Unauthorized gracefully
                console.warn('AuthContext: Session expired or invalid. Clearing session.');
                localStorage.removeItem('token');
                delete api.defaults.headers.common['Authorization'];
                setStoredUser(null);
                setUser(null);
                setToken(null); // Reset local token state to stop SWR retries
            }
        }
    }, [error]);

    const login = (newToken: string | any, userData: User) => {
        console.log('AuthContext Login calling with token (RAW):', newToken, typeof newToken);

        let finalToken = newToken;
        if (typeof newToken === 'object' && newToken !== null) {
            // Handle case where token is { token: "..." } or similar
            if (newToken.token) finalToken = newToken.token;
            else if (newToken.access_token) finalToken = newToken.access_token;
            else finalToken = JSON.stringify(newToken); // Last resort debug
            console.warn('AuthContext: Token was an object, extracted:', finalToken);
        }

        localStorage.setItem('token', finalToken);
        setToken(finalToken); // Trigger SWR
        api.defaults.headers.common['Authorization'] = `Bearer ${finalToken}`;
        setUser(userData);
        setStoredUser(userData);
        mutate(userData, false); // Update SWR cache immediately
    };

    const logout = async () => {
        const currentToken = token;
        const currentUserRole = user?.role;
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

        // Wipe local auth state instantly before network call to prevent useSWR background triggers
        setToken(null);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        clearStoredUser();
        setUser(null);
        mutate(null, false); // Clear SWR cache

        if (currentToken) {
            try {
                await api.post('/logout', {}, {
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
                });
            } catch (error) {
                // Ignore
            }
        }
        
        if (currentUserRole === 'vendor' || currentPath.startsWith('/seller')) {
            router.push('/seller/login');
        } else if (currentUserRole === 'doctor' || currentPath.startsWith('/doctor')) {
            router.push('/doctor/login');
        } else if (currentUserRole === 'super_admin' || currentPath.startsWith('/superadmin')) {
            router.push('/superadmin/login');
        } else {
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading: isLoading && !user, mutate }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
