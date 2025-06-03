import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['oracledb'],
  webpack: (config) => {
    // Fix pour oracledb
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      '@azure/app-configuration': false,
      '@azure/identity': false,
      '@azure/keyvault-secrets': false,
      'oci-common': false,
      'oci-secrets': false,
    };

    return config;
  },
};

export default nextConfig;
