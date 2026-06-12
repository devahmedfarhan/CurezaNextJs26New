import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useSearchFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }

            return params.toString();
        },
        [searchParams]
    );

    const toggleFilter = (key: string, value: string) => {
        const current = searchParams.get(key);
        // For simple single-select filters or toggle logic
        // Ideally we might want array support (e.g. brand=A,B)
        // For now, let's implement simple replacement
        if (current === value) {
            router.push(`?${createQueryString(key, "")}`);
        } else {
            router.push(`?${createQueryString(key, value)}`);
        }
    };

    const setFilter = (key: string, value: string) => {
        router.push(`?${createQueryString(key, value)}`);
    };

    return {
        searchParams,
        toggleFilter,
        setFilter,
    };
}
