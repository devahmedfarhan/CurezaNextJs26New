import apiClient from './client';

export interface Product {
    id: number;
    title: string;
    slug: string;
    description: string;
    short_description: string | null;
    price: number;
    sale_price: number | null;
    stock: number;
    sku: string;
    image: string;
    images: string[];
    category: {
        id: number;
        name: string;
        slug: string;
    } | null;
    brand: {
        id: number;
        name: string;
        slug: string;
    } | null;
    rating: number;
    reviews_count: number;
    is_featured: boolean;
    is_active: boolean;
    requires_prescription: boolean;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    parent_id: number | null;
    children?: Category[];
    products_count?: number;
}

export interface ProductsResponse {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface ProductFilters {
    page?: number;
    per_page?: number;
    category?: string;
    brand?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort?: 'latest' | 'price_asc' | 'price_desc' | 'popular';
    featured?: boolean;
}

// Products API functions
export const productsApi = {
    /**
     * Get paginated list of products
     */
    getProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
        const response = await apiClient.get('/products', { params: filters });
        return response.data;
    },

    /**
     * Get latest products
     */
    getLatestProducts: async (limit = 10): Promise<Product[]> => {
        const response = await apiClient.get('/products/latest', { params: { limit } });
        return response.data.data || response.data;
    },

    /**
     * Get single product by slug
     */
    getProduct: async (slug: string): Promise<Product> => {
        const response = await apiClient.get(`/products/${slug}`);
        return response.data.data || response.data;
    },

    /**
     * Search products
     */
    searchProducts: async (query: string, filters: ProductFilters = {}): Promise<ProductsResponse> => {
        const response = await apiClient.get('/products/search', {
            params: { search: query, ...filters },
        });
        return response.data;
    },

    /**
     * Get product reviews
     */
    getProductReviews: async (productId: number, page = 1): Promise<any> => {
        const response = await apiClient.get(`/products/${productId}/reviews`, { params: { page } });
        return response.data;
    },
};

// Categories API functions
export const categoriesApi = {
    /**
     * Get all categories
     */
    getCategories: async (): Promise<Category[]> => {
        const response = await apiClient.get('/categories');
        return response.data.data || response.data;
    },

    /**
     * Get categories only (type = category)
     */
    getCategoriesOnly: async (): Promise<Category[]> => {
        const response = await apiClient.get('/categories');
        const all = response.data.data || response.data;
        return all.filter((c: Category & { type?: string }) => !c.type || c.type === 'category');
    },

    /**
     * Get concerns only (type = concern)
     */
    getConcerns: async (): Promise<Category[]> => {
        const response = await apiClient.get('/categories');
        const all = response.data.data || response.data;
        return all.filter((c: Category & { type?: string }) => c.type === 'concern');
    },
};


// Brands API functions
export const brandsApi = {
    /**
     * Get all brands (seller stores)
     */
    getBrands: async (): Promise<any[]> => {
        const response = await apiClient.get('/brands');
        return response.data.data || response.data;
    },

    /**
     * Get brand by slug
     */
    getBrand: async (slug: string): Promise<any> => {
        const response = await apiClient.get(`/brand/${slug}`);
        return response.data.data || response.data;
    },
};

export default productsApi;
