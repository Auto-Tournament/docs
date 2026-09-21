import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" width={22} height={22} className="rounded-[5px]" />
          <span className="font-semibold">{appName}</span>
        </>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}`,
    links: [
      { text: 'Discord', url: 'https://discord.gg/n7gHYau7aW', external: true },
    ],
  };
}
