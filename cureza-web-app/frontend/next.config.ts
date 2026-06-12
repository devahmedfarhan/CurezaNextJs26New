import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const cspValue = isProd
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; connect-src 'self' http://127.0.0.1:8000 http://localhost:8000 https://challenges.cloudflare.com; img-src 'self' data: http://127.0.0.1:8000 http://localhost:8000 https://images.unsplash.com; style-src 'self' 'unsafe-inline'; frame-src 'self' https://challenges.cloudflare.com; font-src 'self' data:;"
      : "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src 'self' ws: wss: http://127.0.0.1:8000 http://localhost:8000 https://challenges.cloudflare.com; img-src * data: blob:; style-src 'self' 'unsafe-inline'; frame-src 'self' https://challenges.cloudflare.com; font-src 'self' data:;";

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: cspValue,
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: 'http://127.0.0.1:8000/storage/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
      {
        source: '/sanctum/csrf-cookie',
        destination: 'http://127.0.0.1:8000/sanctum/csrf-cookie',
      },
    ];
  },
};

export default nextConfig;
