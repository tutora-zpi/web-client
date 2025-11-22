import { createRequire } from "module";
const require = createRequire(import.meta.url);

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8002",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA(nextConfig);
