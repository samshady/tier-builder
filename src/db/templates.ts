import type { Board } from '../types';


export const STARTER_TEMPLATES: Board[] = [
  {
    id: 'template-languages',
    title: 'Programming Languages & Runtimes',
    author: 'Curator',
    tiers: [
      { id: 'tier-s', label: 'S', color: '#f38ba8', itemIds: ['lang-ts', 'lang-rust'] },
      { id: 'tier-a', label: 'A', color: '#fab387', itemIds: ['lang-python', 'lang-go'] },
      { id: 'tier-b', label: 'B', color: '#f9e2af', itemIds: ['lang-zig', 'lang-elixir'] },
      { id: 'tier-c', label: 'C', color: '#a6e3a1', itemIds: ['lang-cpp'] },
      { id: 'tier-d', label: 'D', color: '#89b4fa', itemIds: [] },
      { id: 'tier-f', label: 'F', color: '#cba6f7', itemIds: [] },
    ],
    unrankedItemIds: ['lang-js', 'lang-ruby', 'lang-lua', 'lang-java', 'lang-csharp', 'lang-haskell', 'lang-php'],
    items: {
      'lang-ts': { id: 'lang-ts', type: 'text', title: 'TypeScript', tag: 'Web / Node', color: '#3178c6', createdAt: Date.now() },
      'lang-rust': { id: 'lang-rust', type: 'text', title: 'Rust', tag: 'Systems / WASM', color: '#dea584', createdAt: Date.now() },
      'lang-python': { id: 'lang-python', type: 'text', title: 'Python', tag: 'Data / AI / Scripting', color: '#3572a5', createdAt: Date.now() },
      'lang-go': { id: 'lang-go', type: 'text', title: 'Go', tag: 'Cloud / Microservices', color: '#00add8', createdAt: Date.now() },
      'lang-zig': { id: 'lang-zig', type: 'text', title: 'Zig', tag: 'Systems / Toolchain', color: '#ec915c', createdAt: Date.now() },
      'lang-elixir': { id: 'lang-elixir', type: 'text', title: 'Elixir', tag: 'Concurrency / BEAM', color: '#6e4a7e', createdAt: Date.now() },
      'lang-cpp': { id: 'lang-cpp', type: 'text', title: 'C++', tag: 'High Performance', color: '#f34b7d', createdAt: Date.now() },
      'lang-js': { id: 'lang-js', type: 'text', title: 'JavaScript', tag: 'Universal Web', color: '#f7df1e', createdAt: Date.now() },
      'lang-ruby': { id: 'lang-ruby', type: 'text', title: 'Ruby', tag: 'Developer Happiness', color: '#701516', createdAt: Date.now() },
      'lang-lua': { id: 'lang-lua', type: 'text', title: 'Lua', tag: 'Embedded / Game Dev', color: '#000080', createdAt: Date.now() },
      'lang-java': { id: 'lang-java', type: 'text', title: 'Java', tag: 'Enterprise JVM', color: '#b07219', createdAt: Date.now() },
      'lang-csharp': { id: 'lang-csharp', type: 'text', title: 'C#', tag: '.NET Ecosystem', color: '#178600', createdAt: Date.now() },
      'lang-haskell': { id: 'lang-haskell', type: 'text', title: 'Haskell', tag: 'Pure Functional', color: '#5e5086', createdAt: Date.now() },
      'lang-php': { id: 'lang-php', type: 'text', title: 'PHP', tag: 'Modern Hypertext', color: '#4f5d95', createdAt: Date.now() },
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'template-blank',
    title: 'My Custom Tier List',
    author: 'You',
    tiers: [
      { id: 'tier-s', label: 'S', color: '#f38ba8', itemIds: [] },
      { id: 'tier-a', label: 'A', color: '#fab387', itemIds: [] },
      { id: 'tier-b', label: 'B', color: '#f9e2af', itemIds: [] },
      { id: 'tier-c', label: 'C', color: '#a6e3a1', itemIds: [] },
      { id: 'tier-d', label: 'D', color: '#89b4fa', itemIds: [] },
      { id: 'tier-f', label: 'F', color: '#cba6f7', itemIds: [] },
    ],
    unrankedItemIds: [],
    items: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
