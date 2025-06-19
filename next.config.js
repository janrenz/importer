/** @type {import('next').NextConfig} */
const nextConfig = {
  // No experimental flags needed for Next.js 15
  output: 'export',
  trailingSlash: true,
  assetPrefix: '.',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig