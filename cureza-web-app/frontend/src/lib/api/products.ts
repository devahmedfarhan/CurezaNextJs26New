import api from '@/lib/api';

export const getRelatedProducts = async (id: number | string) => {
    const response = await api.get(`/products/${id}/related`);
    return response.data;
};

export const getUpsellProducts = async (id: number | string) => {
    const response = await api.get(`/products/${id}/upsells`);
    return response.data;
};

export const getRecentlyViewedProducts = async () => {
    const response = await api.get('/products/recently-viewed');
    return response.data;
};

export const getProductBundles = async (id: number | string) => {
    const response = await api.get(`/products/${id}/bundles`);
    return response.data;
};
