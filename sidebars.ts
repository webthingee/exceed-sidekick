import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// The Guides sidebar holds the long-form pages (How to Play, Solo Rules).
// The Glossary is a standalone interactive page at /glossary, not in this sidebar.
const sidebars: SidebarsConfig = {
  guidesSidebar: [
    'how-to-play',
    'anatomy-of-a-strike',
    'solo-rules',
  ],
};

export default sidebars;
