import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { getLayoutTabs, type LayoutTab } from 'fumadocs-ui/layouts/shared';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/'>) {
  const tree = source.getPageTree();
  // The CS2 plugin and server manager are root folders, so they get their own
  // tabs. Add a "Platform" tab for everything else, so the switcher always
  // has a way back to the main docs.
  const platform: LayoutTab = {
    title: 'Auto Tournament',
    description: 'The platform',
    url: '/',
    urls: new Set(source.getPages().map((p) => p.url).filter((u) => !u.startsWith('/cs2'))),
  };
  return (
    <DocsLayout tree={tree} {...baseOptions()} tabs={[platform, ...getLayoutTabs(tree)]}>
      {children}
    </DocsLayout>
  );
}
