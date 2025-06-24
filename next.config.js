const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  // Active l'alias @ → src/
  webpack: (config, { isServer }) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    
    // Exclure oracledb du bundling côté client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
      };
      
      // Ignorer complètement oracledb côté client
      config.externals = config.externals || [];
      config.externals.push('oracledb');
    }
    
    return config;
  },
  
  // Packages externes pour les server components
  experimental: {
    serverComponentsExternalPackages: ['oracledb']
  }
};
