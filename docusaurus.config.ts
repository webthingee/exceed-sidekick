import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// --- GitHub Pages ---
// Update these for your repo, then enable Pages (Source: GitHub Actions).
// For a project page the site is served at https://<org>.github.io/<projectName>/
const organizationName = 'webthingee';
const projectName = 'exceed-sidekick';

const config: Config = {
  title: 'Exceed Sidekick',
  tagline: 'A searchable reference for the Exceed Fighting System',
  favicon: 'img/favicon.ico',

  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: `https://${organizationName}.github.io`,
  baseUrl: `/${projectName}/`,
  organizationName,
  projectName,
  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: {
          path: 'blog',
          routeBasePath: 'hacking-a-card',
          blogTitle: 'Hacking a Card',
          blogDescription: 'Card-by-card Exceed Fighting System strategy breakdowns.',
          blogSidebarTitle: 'Recent hacks',
          showReadingTime: true,
          onInlineTags: 'ignore',
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      // Offline / local full-text search (no Algolia account required).
      // https://github.com/easyops-cn/docusaurus-search-local
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Exceed Sidekick',
      items: [
        {to: '/glossary', label: 'Glossary', position: 'left'},
        {to: '/turn-order', label: 'Turn Order', position: 'left'},
        {to: '/docs/solo-rules', label: 'Solo Rules', position: 'left'},
        {
          type: 'docSidebar',
          sidebarId: 'guidesSidebar',
          position: 'left',
          label: 'Guides',
        },
        {to: '/hacking-a-card', label: 'Hacking a Card', position: 'left'},
        {
          href: `https://github.com/${organizationName}/${projectName}`,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Reference',
          items: [
            {label: 'Glossary', to: '/glossary'},
            {label: 'Turn Order', to: '/turn-order'},
            {label: 'Solo Rules', to: '/docs/solo-rules'},
            {label: 'How to Play', to: '/docs/how-to-play'},
            {label: 'Anatomy of a Strike', to: '/docs/anatomy-of-a-strike'},
          ],
        },
      ],
      copyright: `Exceed Sidekick. Content from the Exceed Fighting System rules. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
