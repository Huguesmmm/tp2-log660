import type { NextConfig } from "next";
import { IgnorePlugin } from "webpack";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["oracledb"],
  webpack: (config, { isServer }) => {
    // Fix pour oracledb
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      "@azure/app-configuration": false,
      "@azure/identity": false,
      "@azure/keyvault-secrets": false,
      "oci-common": false,
      "oci-secrets": false,
      "@sap/hana-client": false,
    };

    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    if (isServer) {
      config.plugins.push(
        new IgnorePlugin({
          resourceRegExp:
            /^(pg-native|pg-query-stream|mysql|mysql2|sqlite3|better-sqlite3|react-native-sqlite-storage|sql.js|@sap\/hana-client)$/,
        }),
      );
    }

    return config;
  },
};

export default nextConfig;
