<!--
Draft blog / website post for the October 2026 betas. Not published.
The docs site has no blog or news section, so this lives outside content/ and is not built.
Before publishing:
- All three releases are out (2026-09-29).
- Use the Auto Tournament icon for the post image. No MatchZy branding.
-->

# New betas: one CS2 install for all your servers, and matches that recover on their own

Today we're publishing three betas that work together:

- **Auto Tournament 3.0.0-beta.14**, the tournament platform
- **Ready Up 0.1.0-beta.1**, our CS2 match plugin, in its first public build
- **CS2 Server Manager (csm) 1.12.0**, which installs and runs the servers

Together they let the platform run your servers for you: it hands out matches, recovers
crashed ones, starts and stops servers to fit the bracket, and adds new machines with one
command. These are betas. Try them on test servers and scrims first.

More about each one: [Auto Tournament](https://autotournament.gg/platform),
[Ready Up](https://autotournament.gg/games/cs2/ready-up) and
[CS2 Server Manager](https://autotournament.gg/games/cs2/csm).

## One CS2 install, unlimited servers

Until now, every server csm ran was a full copy of CS2, about 69 GB each. Ten servers meant
ten copies.

csm 1.12.0 adds **instance mode**. Every server runs from one shared, read-only CS2 install.
Each instance only stores the files it writes itself: logs, demos, round backups. In our
tests, a new instance took about **10 MB of disk and 5 seconds** to create.

It uses Linux overlayfs inside an unprivileged user namespace, so it needs no root and no
sudo (Linux 5.11 or newer). Each instance gets its own ports, console and crash restart.

CS2 updates are safe too. csm never writes to an install a running server uses. It builds the
new version next to the old one, moves idle servers onto it, and leaves busy ones alone until
their match ends.

What doesn't change: memory. Each running CS2 server still needs its own RAM, about 1 to 2 GB.
Instance mode saves disk and setup time, not RAM.

```bash
csm instance layer build
csm instance create
csm instance start all
```

## Automatic by default

With Ready Up servers linked to the platform, these are on out of the box. You can turn each
one off on the Servers page.

- **Failover.** If a server crashes or hangs mid-match, the platform picks the match up from
  the last round backup. On a machine run by csm, it restarts that server first and resumes
  the match there, at the same address. If that doesn't work, the match moves to a free
  server, and players see the new address and password on the match page. If no server is
  free, csm creates one.
- **Spares.** The platform keeps a free server for failover once two servers are online.
- **Auto-scaling.** The platform starts stopped servers when the bracket needs them, creates
  a new one when it runs short, and stops idle ones after 10 minutes. It never stops a server
  with a match on it, and never deletes a server.
- **Updates only between matches.** CS2 and Ready Up updates wait until a server is idle.
  Anything that would interrupt a match needs an admin and a reason.

## Add a machine with one command

On the platform, go to **Servers → Machines → Add machine**. It shows one command. Run it on
the machine:

```bash
csm link https://your-platform ABCD-1234-...
csm agent install
```

That's it. The machine connects to the platform over one outgoing connection. No SSH, no open
port. From the platform you can see CPU, RAM and disk, create servers, start, stop and restart
them, and update CS2 or Ready Up.

## Ready Up replaces the old plugin

Ready Up is our own CS2 match plugin. It loads straight into CS2: **no Metamod, no
CounterStrikeSharp, no .NET**. Every engine hook it uses is checked against each new CS2
build, and if an update breaks one, only that feature turns off. The server keeps running.

It does everything the old Auto Tournament CS2 plugin did. We tracked this row by row in
[PARITY.md](https://github.com/Auto-Tournament/ready-up/blob/master/docs/PARITY.md): 101 of
101 done. Ready-up, knife rounds, pauses, restores, coaches, overtime, full player stats,
demos, whitelist, practice mode, admin calls.

It works both ways:

- **With the platform**, it keeps one live connection. The platform assigns matches, sees
  every round as it happens, receives the demo while it records, and stores a backup of every
  round.
- **On its own**, it runs scrims when the server is idle and loads match configs from a file
  or URL. Nothing waits for a platform.

Your existing servers keep working. The platform runs old-plugin servers and Ready Up servers
side by side, so you can move one server at a time.

## Practice: replay a pro round

Ready Up's practice mode has a new command, `.scen`. Load a round from a pro demo and pick one
of the ten players. You spawn where they stood, with their health, armor, money and weapons.
Bots replay the other nine, smokes, flashes and molotovs included. When a bot spots you, it
stops following the recording and plays for real.

You can turn your own demos into scenarios with the included converter. Practice mode also
has a lineup library (`.savenade`, `.loadnade`), grenade rethrow (`.rethrow`, `.throwidx`),
`.fas`, `.showspawns`, dry runs and the other tools from the old plugin.

## Webhooks and a teams API for event websites

If your event has its own website, it can now follow along:

- **Webhooks** send a signed message when a match is ready, goes live, changes score or ends.
  `match.ready` includes the server address, password and a `steam://connect` link, so your
  site can show each player a "connect now" button.
- The **teams API** lets your site push its teams, with its own IDs, into Auto Tournament.

See [Webhooks and teams API](https://docs.autotournament.gg/reference/webhooks).

## Licensing

Auto Tournament, Ready Up and csm are **free for non-commercial use**: your LAN with friends,
your community cup, your club.

For commercial use, **you need a license**. For Ready Up, that means every server running it
at a for-profit event needs a license, including spare, practice and test servers.

The first time an admin opens the platform, it asks once which one applies, and you type
`I AGREE`. The Ready Up installer and csm ask the same question. Nothing is ever blocked or
switched off by the license check. See [pricing](https://autotournament.gg/pricing) and
[licensing](https://docs.autotournament.gg/reference/licensing).

## How to try the betas

Try them on a test setup first.

**Platform.** In `docker-compose.yml`, set the image to the `next` tag, then pull:

```yaml
image: ghcr.io/auto-tournament/auto-tournament:next
```

```bash
docker compose pull && docker compose up -d
```

**CS2 Server Manager.** Update csm (the TUI offers it), then switch a host to Ready Up on the
beta channel:

```bash
csm plugins stack readyup
csm plugins channel beta
csm plugins license noncommercial   # or commercial
csm update-plugins
```

**Ready Up without csm.** From the server root (the folder with `game/`):

```bash
curl -fsSL https://raw.githubusercontent.com/Auto-Tournament/ready-up/master/install.sh \
  | bash -s -- --channel beta
```

Keep passing `--channel beta` when you update, until Ready Up has a stable release.

Release notes:
[platform](https://github.com/Auto-Tournament/auto-tournament/releases/tag/v3.0.0-beta.14),
[Ready Up](https://github.com/Auto-Tournament/ready-up/releases/tag/v0.1.0-beta.1),
[csm](https://github.com/Auto-Tournament/cs2-server-manager/releases/tag/v1.12.0).

## Known limitations

- **These are betas.** The platform and Ready Up have been play-tested together with bots on
  our test servers. Matches with human players are still being checked. Keep your current
  setup for anything that matters.
- **Instance mode is Ready Up only**, and needs Linux 5.11 or newer.
- Failover, auto-scaling and streamed demos work with Ready Up servers. Servers on the old
  plugin work as before, without them.
- Ready Up runs on Linux servers only.

Found something? Tell us on [Discord](https://discord.gg/n7gHYau7aW) or open an issue on
GitHub.
