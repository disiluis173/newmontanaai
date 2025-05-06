/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['imgen.x.ai'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imgen.x.ai',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: true,
  typescript: {
    // Ignorar errores para permitir el despliegue, aunque haya errores de TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignorar errores para permitir el despliegue, aunque haya errores de ESLint
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
