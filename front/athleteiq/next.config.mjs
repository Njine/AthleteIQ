/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during the build process
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during the build process
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
