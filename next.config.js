/** @type {import('next').NextConfig} */
const nextConfig = {
  // No experimental flags needed for Next.js 15
  output: 'export',
  trailingSlash: true,
  // Use relative paths for static export but handle callback route properly
  assetPrefix: process.env.NODE_ENV === 'production' ? '.' : '',
  images: {
    unoptimized: true
  },
  // Ensure callback route works in static export
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/callback': { page: '/callback' }
    }
  }
}

module.exports = nextConfig