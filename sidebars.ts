import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// The Guides sidebar holds the long-form pages (How to Play, etc.).
// The Glossary is a standalone interactive page at /glossary, not in this sidebar.
// Add per-game guide pages here as you write them under docs/.
const sidebars: SidebarsConfig = {
  guidesSidebar: ['getting-started', 'how-to-play', 'solo-rules'],
};

export default sidebars;
