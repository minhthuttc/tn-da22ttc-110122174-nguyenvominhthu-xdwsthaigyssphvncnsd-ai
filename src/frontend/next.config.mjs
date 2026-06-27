/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false, // Tắt indicator "compiling..."
    appIsrStatus: false,  // Tắt ISR status
  },
};

export default nextConfig;
