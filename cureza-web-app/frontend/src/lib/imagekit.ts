/**
 * ImageKit.io URL helper and transformations utility
 */

const URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/4ittgqft0';

export function getImageKitUrl(
  src: string,
  transformations: string | Record<string, string | number> | Array<Record<string, string | number>> = {}
): string {
  if (!src) return '/fallback.png';

  // If it's a relative storage path, format it to show from storage
  if (src.startsWith('/storage/')) {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    return `${backend}${src}`;
  }

  // If it's not an ImageKit URL, return it as is
  if (!src.includes('ik.imagekit.io')) {
    return src;
  }

  // Parse existing URL to separate base and query params
  const [basePath, queryStr] = src.split('?');
  const params = new URLSearchParams(queryStr || '');

  let trString = '';

  if (typeof transformations === 'string') {
    trString = transformations;
  } else if (Array.isArray(transformations)) {
    trString = transformations
      .map((t) => Object.entries(t).map(([k, v]) => `${k}-${v}`).join(','))
      .join(':');
  } else if (typeof transformations === 'object') {
    trString = Object.entries(transformations)
      .map(([k, v]) => {
        // Map common properties to ImageKit shortcodes
        const keyMap: Record<string, string> = {
          width: 'w',
          height: 'h',
          quality: 'q',
          format: 'f',
          blur: 'bl',
          rotation: 'rt',
          crop: 'c',
          aspectRatio: 'ar',
          grayscale: 'e-grayscale',
          sharpen: 'e-sharpen',
          contrast: 'co',
          brightness: 'bg',
        };
        const shortKey = keyMap[k] || k;
        return `${shortKey}-${v}`;
      })
      .join(',');
  }

  if (trString) {
    params.set('tr', trString);
  }

  // Add automatic format optimization if not explicitly set
  if (!params.has('tr') || !params.get('tr')?.includes('f-')) {
    const currentTr = params.get('tr') || '';
    params.set('tr', currentTr ? `${currentTr},f-auto` : 'f-auto');
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Shorthand helpers for common layouts
 */
export const imageKitHelpers = {
  thumbnail: (url: string) => getImageKitUrl(url, 'w-150,h-150,fo-auto'),
  small: (url: string) => getImageKitUrl(url, 'w-300'),
  medium: (url: string) => getImageKitUrl(url, 'w-600'),
  large: (url: string) => getImageKitUrl(url, 'w-1200'),
  banner: (url: string) => getImageKitUrl(url, 'w-1920,h-600,c-at_max'),
  square: (url: string) => getImageKitUrl(url, 'w-500,h-500,cm-pad_resize,bg-F8F3EF'),
  rounded: (url: string, radius = 20) => getImageKitUrl(url, `r-${radius}`),
  blur: (url: string, intensity = 10) => getImageKitUrl(url, `bl-${intensity}`),
  grayscale: (url: string) => getImageKitUrl(url, 'e-grayscale'),
  quality: (url: string, pct = 80) => getImageKitUrl(url, `q-${pct}`),
};
