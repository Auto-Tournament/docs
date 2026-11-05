import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  // Pages that moved. Old links (READMEs, forum posts, released apps) keep working.
  async redirects() {
    return [
      // MatchZy Enhanced (the 2.x plugin, /cs2/plugin before that) is gone: 3.x runs Ready Up only.
      ...['/cs2/matchzy-enhanced', '/cs2/plugin'].flatMap((old) => [
        ...['install', 'configuration', 'commands', 'troubleshooting'].map((page) => ({
          source: `${old}/${page}`,
          destination: `/cs2/ready-up/${page}`,
          permanent: true,
        })),
        { source: `${old}/building`, destination: '/cs2/ready-up/sdk', permanent: true },
        { source: `${old}/:path*`, destination: '/cs2/ready-up', permanent: true },
        { source: old, destination: '/cs2/ready-up', permanent: true },
      ]),
      { source: '/modules/cs2/matchzy-enhanced', destination: '/cs2/ready-up', permanent: true },
      { source: '/reference/changelog/cs2-plugin', destination: '/reference/changelog/matchzy-enhanced', permanent: true },
      { source: '/guides/sign-in/keycloak', destination: '/guides/sign-in/oidc', permanent: true },
    ];
  },
};

export default withMDX(config);
