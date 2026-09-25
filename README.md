# Auto Tournament docs

Source for [docs.autotournament.gg](https://docs.autotournament.gg), built with [Fumadocs](https://fumadocs.dev).

<div align="center">

### Sponsor Auto Tournament

Running tournaments or LANs with Auto Tournament? Your organisation can keep it growing.
Auto Tournament is built and maintained by one person — sponsorships pay for development, test servers and infrastructure.

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/sivert-io)
[![Support on Ko-fi](https://img.shields.io/badge/Support-Ko--fi-ff5e5b?logo=kofi&logoColor=white)](https://ko-fi.com/sivert)
[![Become a sponsor](https://img.shields.io/badge/Become%20a%20sponsor-Discord-5865F2?logo=discord&logoColor=white)](https://discord.gg/n7gHYau7aW)

Using it for a business, paid events or hosting? That needs a commercial licence → [Licensing](https://docs.autotournament.gg/reference/licensing)

</div>

Pages live in `content/docs` as MDX. The site serves them from the root, so
`content/docs/getting-started/install.mdx` is `/getting-started/install`.

```bash
yarn install
yarn dev
```

## Deploy

The site runs as a Docker container on the docs host. A cron job runs
`scripts/auto_update.sh` every five minutes; it rebuilds and restarts the
container when `main` has a new commit. The container listens on
port 31235, and the astro Cloudflare tunnel routes `docs.autotournament.gg` to `http://dev.lan:31235`.

## Sponsors

Your logo here — [sponsor Auto Tournament](https://discord.gg/n7gHYau7aW) to be listed.
