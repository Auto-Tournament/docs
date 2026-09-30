import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  // Pages that moved. Old links (READMEs, forum posts, released apps) keep working.
  async redirects() {
    return [
      { source: '/cs2/plugin', destination: '/cs2/matchzy-enhanced', permanent: true },
      { source: '/cs2/plugin/:path*', destination: '/cs2/matchzy-enhanced/:path*', permanent: true },
      { source: '/reference/changelog/cs2-plugin', destination: '/reference/changelog/matchzy-enhanced', permanent: true },
      { source: '/guides/sign-in/keycloak', destination: '/guides/sign-in/oidc', permanent: true },
    ];
  },
};

export default withMDX(config);
