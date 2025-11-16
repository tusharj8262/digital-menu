/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,  // sharp remove → fast build
  },
  experimental: {
    optimizeCss: false, // Vercel CSS optimizer off → errors बंद
  },
  typescript: {
    ignoreBuildErrors: true, // optional but helpful for production build
  },
  eslint: {
    ignoreDuringBuilds: true, // eslint issues मुळे build fail होणार नाही
  },
};

export default nextConfig;
