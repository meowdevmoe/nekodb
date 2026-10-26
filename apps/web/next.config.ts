import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // During `next dev` the API lives on the server's container port.
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? ['api', 'card', 'spotify', 'counter', 'counter-preview'].map((p) => ({ source: `/${p}/:path*`, destination: `http://127.0.0.1:3741/${p}/:path*` }))
      : [];
  },
};

export default config;
