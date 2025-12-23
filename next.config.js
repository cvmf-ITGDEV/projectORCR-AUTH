/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly using Webpack (default in Next.js 14)
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
