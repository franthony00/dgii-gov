/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <--- AGREGA ESTA LÍNEA ESENCIAL
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Si tu repo se llama dgii.gov.do, descomenta la siguiente línea:
  // basePath: '/dgii.gov.do', 
};

export default nextConfig;
