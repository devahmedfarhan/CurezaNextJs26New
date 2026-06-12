/**
 * Format utilities for safe number display
 * Handles null, undefined, and invalid number values
 */

/**
 * Safely format a price value
 * @param value - The price value (can be null/undefined)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export const formatPrice = (value: number | null | undefined, decimals: number = 0): string => {
    const num = Number(value ?? 0);
    return num.toFixed(decimals);
};

/**
 * Safely format a number value
 * @param value - The number value (can be null/undefined)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted number string
 */
export const formatNumber = (value: number | null | undefined, decimals: number = 1): string => {
    const num = Number(value ?? 0);
    return num.toFixed(decimals);
};

/**
 * Safely get a number value with fallback
 * @param value - The value to convert
 * @param fallback - Fallback value (default: 0)
 * @returns Valid number
 */
export const safeNumber = (value: number | null | undefined, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
};
