/** @type {import('next').NextConfig} */
const nextConfig = {
  // 靜態導出配置
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // 環境變量配置
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
  },



  webpack: (config, { isServer }) => {
    // 只保留前端必要的 webpack 配置
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },

  // 排除後端相關目錄
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // 靜態文件配置
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // 移除 PWA 配置以減少依賴
  experimental: {
    // 移除不必要的實驗性功能
  }
};

module.exports = nextConfig;
