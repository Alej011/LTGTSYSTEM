/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // En desarrollo el indicador de Next tapaba el pie del sidebar
  devIndicators: { position: "bottom-right" },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
