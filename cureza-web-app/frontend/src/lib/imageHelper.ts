export const getImageUrl = (path: string | null | undefined) => {
    if (!path || typeof path !== 'string') return '/placeholder.png'; // Or a default placeholder image
    if (path.startsWith('http')) return path;

    // Remove leading slash if present to avoid double slashes if API_URL has trailing slash
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // Assuming API is at 127.0.0.1:8000 for now, or use env var
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

    return `${baseUrl}/${cleanPath}`;
};
