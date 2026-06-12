const STORAGE_KEY = 'cureza_user_data';

export const getStoredUser = () => {
    if (typeof window === 'undefined') return null;
    try {
        const item = localStorage.getItem(STORAGE_KEY);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading user from storage', error);
        return null;
    }
};

export const setStoredUser = (user: any) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('Error saving user to storage', error);
    }
};

export const clearStoredUser = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
};
