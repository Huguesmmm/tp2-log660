/** @type {import("next").NextConfig} */
const nextConfig = {
  serverExternalPackages: ["oracledb"],
  experimental: {
    esmExternals: "loose",
  },
}

module.exports = nextConfig
