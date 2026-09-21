# Auto Tournament docs

Source for [docs.autotournament.gg](https://docs.autotournament.gg), built with [Fumadocs](https://fumadocs.dev).

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
