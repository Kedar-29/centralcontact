/* eslint-disable @typescript-eslint/no-require-imports */
const withPWA = require("next-pwa");
const nextConfig = require("./next.config.ts").default;

const isDev = process.env.NODE_ENV === "development";

module.exports = withPWA({
  ...nextConfig,
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev,
});
