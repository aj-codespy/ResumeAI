import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Required for puppeteer-core and @sparticuz/chromium-min to work in Vercel Serverless Functions
    // and potentially in Next.js server actions/route handlers depending on the environment.
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
  },
};

export default nextConfig;
