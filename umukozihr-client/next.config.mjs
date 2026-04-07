/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow ngrok tunnels and any custom dev domains to access the Next.js dev server
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io"],
  async rewrites() {
    return [
      { source: "/api/backend/:path*", destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/:path*` },
    ];
  },
};
export default nextConfig;
