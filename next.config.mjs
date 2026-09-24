import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/modules/cs2/matchzy-enhanced',
        destination: '/modules/cs2/cs2-plugin',
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
