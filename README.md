<div align="center">
  <h1>Auto Tournament docs</h1>
  <p><strong>Source for docs.autotournament.gg</strong></p>
  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-PolyForm%20Noncommercial-blue.svg" alt="License: PolyForm Noncommercial" /></a>
    <a href="https://docs.autotournament.gg"><img src="https://img.shields.io/badge/docs-docs.autotournament.gg-blue" alt="Docs" /></a>
    <a href="https://discord.gg/n7gHYau7aW"><img src="https://img.shields.io/badge/Discord-join-5865F2?logo=discord&logoColor=white" alt="Discord" /></a>
  </p>
</div>

<br />

The documentation for [Auto Tournament](https://github.com/Auto-Tournament/auto-tournament), [Ready Up](https://github.com/Auto-Tournament/ready-up), [CS2 Server Manager](https://github.com/Auto-Tournament/cs2-server-manager) and [MatchZy Enhanced](https://github.com/Auto-Tournament/matchzy-enhanced), built with [Fumadocs](https://fumadocs.dev).

## Development

Pages live in `content/docs` as MDX. The site serves them from the root, so `content/docs/getting-started/install.mdx` is `/getting-started/install`.

```bash
git clone https://github.com/Auto-Tournament/docs.git
cd docs
yarn install
yarn dev
```

The site runs at `http://localhost:3000`.

## Deploy

The site runs as a Docker container on the docs host. A cron job runs `scripts/auto_update.sh` every five minutes and rebuilds and restarts the container when `main` has a new commit. The container listens on port 31235, and the astro Cloudflare tunnel routes `docs.autotournament.gg` to `http://dev.lan:31235`.

## Contributing

Fixes and new pages are welcome: edit the MDX file and open a pull request.

## Sponsors

Auto Tournament is built by one person. A sponsorship pays for development and test servers: [GitHub Sponsors](https://github.com/sponsors/sivert-io) or [Ko-fi](https://ko-fi.com/sivert).

<!-- sponsors:start -->
<!-- sponsors:end -->

## License

The docs are licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). Copyright (c) 2026 Sivert Gullberg Hansen.
