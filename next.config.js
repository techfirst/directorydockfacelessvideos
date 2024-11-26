/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "directorydock.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_URL: "https://facelessvideolist.com", // Replace with your actual domain
  },
};

module.exports = nextConfig;
