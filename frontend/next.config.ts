import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['lucide-react'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },
};

export default nextConfig;
