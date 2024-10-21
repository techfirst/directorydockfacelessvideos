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
    ],
  },
};

module.exports = nextConfig;
