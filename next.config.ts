import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['typeorm'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('typeorm');

      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'react-native-sqlite-storage': false,
        '@sap/hana-client': false,
        'mysql': false,
        'mysql2': false,
        'oracledb': false,
        'pg-query-stream': false,
        'redis': false,
        'ioredis': false,
        'better-sqlite3': false,
        'sqlite3': false,
        'sql.js': false,
        'mssql': false,
      };
    }
    return config;
  },
};

export default nextConfig;
