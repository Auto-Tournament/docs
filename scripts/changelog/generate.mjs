#!/usr/bin/env node
// Generates the changelog pages in content/docs/reference/changelog/ from the
// GitHub releases of each product. The GitHub release notes are the source of
// truth; never edit the generated .mdx files by hand.
//
//   node scripts/changelog/generate.mjs      (or: yarn changelog)
//
// Set GITHUB_TOKEN (or GH_TOKEN) to avoid the 60 requests/hour anonymous limit.
// The output is committed, so `yarn build` never calls the GitHub API. A
// scheduled workflow (.github/workflows/changelog.yml) reruns this and commits
// any change. If the API fails, the script exits non-zero and writes nothing.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const outDir = join(root, 'content', 'docs', 'reference', 'changelog');

const products = [
  {
    slug: 'platform',
    repo: 'Auto-Tournament/auto-tournament',
    name: 'Auto Tournament',
    title: 'Auto Tournament changelog',
    description: 'Release notes for each version of the Auto Tournament platform.',
    docs: '/',
    intro:
      'Versions before 3.0 were released as **MatchZy Auto Tournament** (MAT). Their notes are under [Earlier versions](#earlier-versions). **3.0 is in beta**: the `3.0.0-beta.N` releases below are the 3.0 notes until 3.0.0 ships. See [Upgrading to 3.0](/guides/upgrading-to-3).',
    earlier: 'platform-2.x.md',
  },
  {
    slug: 'ready-up',
    repo: 'Auto-Tournament/ready-up',
    name: 'Ready Up',
    title: 'Ready Up changelog',
    description: 'Release notes for each version of Ready Up, the native CS2 server plugin.',
    docs: '/cs2/ready-up',
    intro: 'Ready Up is the native CS2 server plugin that replaces MatchZy Enhanced for new setups.',
  },
  {
    slug: 'csm',
    repo: 'Auto-Tournament/cs2-server-manager',
    name: 'CS2 Server Manager (csm)',
    title: 'CS2 Server Manager changelog',
    description: 'Release notes for each version of CS2 Server Manager (csm).',
    docs: '/cs2/server-manager',
    intro: 'CS2 Server Manager (`csm`) runs several CS2 servers on one Linux machine.',
  },
  {
    slug: 'matchzy-enhanced',
    repo: 'Auto-Tournament/matchzy-enhanced',
    name: 'MatchZy Enhanced (ME)',
    title: 'MatchZy Enhanced changelog',
    description: 'Release notes for each version of MatchZy Enhanced (ME), the MatchZy-based CS2 plugin.',
    docs: '/cs2/matchzy-enhanced',
    intro:
      'MatchZy Enhanced (ME) is the MatchZy-based CS2 plugin. Releases before 2.0.0 were titled MatchZy, and 2.0.0 was briefly titled Auto Tournament CS2. [Ready Up](/reference/changelog/ready-up) is the plugin for new Auto Tournament 3.0 setups.',
  },
];

// Sections that repeat in every release and belong in the install docs, not
// the changelog. Matched against the heading text, case-insensitive.
const dropSections = [
  /^docker images$/i,
  /^pull command$/i,
  /^docker hub/i,
  /^platforms$/i,
  /^quick start$/i,
  /^install(ation)?$/i,
  /^downloads?$/i,
  /^requirements$/i,
  /^configuration$/i,
  /^build$/i,
  /^testing$/i,
];
// Headings whose content stays but whose heading adds nothing on a changelog page.
const unwrapSections = [/^changelog$/i];

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

async function fetchReleases(repo) {
  const releases = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'auto-tournament-docs-changelog',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const reset = res.headers.get('x-ratelimit-reset');
      const hint =
        res.status === 403 || res.status === 429
          ? ` (rate limited${reset ? ` until ${new Date(Number(reset) * 1000).toISOString()}` : ''}; set GITHUB_TOKEN)`
          : '';
      throw new Error(`${repo}: GitHub API ${res.status} ${res.statusText}${hint}`);
    }
    const batch = await res.json();
    releases.push(...batch);
    if (batch.length < 100) break;
  }
  return releases
    .filter((r) => !r.draft)
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
}

// Escape text so MDX does not read it as JSX or an expression. Code spans and
// fenced code blocks are left alone.
// Bare "#123" references are linked to the pull request or issue.
function escapeMdxText(text, repo) {
  return text
    .replace(/<(https?:\/\/[^>\s]+)>/g, '[$1]($1)')
    .replace(/[{}]/g, (c) => `\\${c}`)
    .replace(/</g, '&lt;')
    .replace(/(^|[\s(])#(\d+)\b/g, (_, pre, n) => `${pre}[#${n}](https://github.com/${repo}/pull/${n})`);
}

function escapeMdxLine(line, repo) {
  return line
    .split(/(`+[^`]*`+)/)
    .map((part, i) => (i % 2 === 1 ? part : escapeMdxText(part, repo)))
    .join('');
}

// Heading text without a leading emoji or symbol ("🧪 Beta Release" -> "Beta Release").
const headingText = (text) => text.replace(/^[^\p{L}\p{N}`*_]+/u, '');

function cleanBody(body, release, repo) {
  let text = (body ?? '').replace(/\r\n/g, '\n').replace(/<!--[\s\S]*?-->/g, '');
  const tag = release.tag_name.replace(/^v/, '');
  const lines = text.split('\n');

  // Drop a leading title line that only repeats the version.
  while (lines.length && lines[0].trim() === '') lines.shift();
  if (lines.length && /^(#+\s|\*\*)/.test(lines[0]) && lines[0].includes(tag)) lines.shift();

  // Kept headings start at ### (each release is a ## on the page).
  const headings = lines
    .map((l) => l.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/))
    .filter((h) => h && ![...dropSections, ...unwrapSections].some((re) => re.test(headingText(h[2]))))
    .map((h) => h[1].length);
  const shift = headings.length ? 3 - Math.min(...headings) : 0;

  const out = [];
  let inFence = false;
  let skipLevel = 0; // > 0 while inside a dropped section
  for (const line of lines) {
    const fence = /^\s*(```|~~~)/.test(line);
    if (!inFence) {
      const h = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (h) {
        const level = h[1].length;
        if (skipLevel && level > skipLevel) continue;
        skipLevel = 0;
        const title = headingText(h[2]);
        if (dropSections.some((re) => re.test(title))) {
          skipLevel = level;
          continue;
        }
        if (unwrapSections.some((re) => re.test(title))) continue;
        out.push(`${'#'.repeat(Math.min(6, level + shift))} ${escapeMdxLine(title, repo)}`);
        continue;
      }
    }
    if (skipLevel) {
      if (fence) inFence = !inFence;
      continue;
    }
    if (fence) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (/^This is a \*\*prerelease\/beta build\*\*/.test(line)) continue;
    if (/^Built from commit \w+\s*$/.test(line)) continue;
    out.push(escapeMdxLine(line, repo));
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function renderRelease(release, repo) {
  const date = (release.published_at ?? release.created_at).slice(0, 10);
  const badge = release.prerelease
    ? ' · <span className="rounded border border-amber-500/50 px-1.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">Pre-release</span>'
    : '';
  const body = cleanBody(release.body, release, repo);
  return [
    `## ${release.tag_name}`,
    '',
    `<p className="text-sm text-fd-muted-foreground">${date}${badge} · [Release on GitHub](${release.html_url})</p>`,
    '',
    body || '_No release notes._',
    '',
  ].join('\n');
}

const header = (title, description, icon) =>
  `---\ntitle: ${title}\ndescription: ${description}\n${icon ? `icon: ${icon}\n` : ''}---\n\n{/* Generated by scripts/changelog/generate.mjs from GitHub releases. Do not edit by hand: edit the release notes on GitHub and rerun the script. */}\n\n`;

async function main() {
  const results = await Promise.all(products.map(async (p) => ({ ...p, releases: await fetchReleases(p.repo) })));
  await mkdir(outDir, { recursive: true });

  for (const p of results) {
    let page = header(p.title, p.description);
    page += `${p.intro} Newest first. Each entry is the [GitHub release](https://github.com/${p.repo}/releases) for that version. [Docs](${p.docs}).\n\n`;
    page += p.releases.map((r) => renderRelease(r, p.repo)).join('\n');
    if (p.earlier) {
      const earlier = await readFile(join(here, p.earlier), 'utf8');
      page += `\n## Earlier versions\n\nNotes for versions before 3.0, written by hand when they shipped. These versions have no GitHub release.\n\n${earlier.trim()}\n`;
    }
    await writeFile(join(outDir, `${p.slug}.mdx`), page.replace(/\n{3,}/g, '\n\n'));
  }

  let index = header('Changelog', 'Release notes for every Auto Tournament product.', 'ScrollText');
  index +=
    'Every product has its own changelog. They are generated from the release notes on GitHub, so the two always match.\n\n';
  index += '| Product | Latest release | Date |\n| --- | --- | --- |\n';
  for (const p of results) {
    const latest = p.releases[0];
    const date = latest ? latest.published_at.slice(0, 10) : '';
    const tag = latest ? `${latest.tag_name}${latest.prerelease ? ' (pre-release)' : ''}` : 'none yet';
    index += `| [${p.name}](/reference/changelog/${p.slug}) | ${tag} | ${date} |\n`;
  }
  await writeFile(join(outDir, 'index.mdx'), index);
  console.log(results.map((p) => `${p.slug}: ${p.releases.length} releases`).join('\n'));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
