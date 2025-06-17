/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.watchOptions = {
      ...config.watchOptions,
      // Ignore this file because it caused the first login to fail
      ignored: ["**/next-env.d.ts"],
    };
    return config;
  },
};

export default nextConfig;