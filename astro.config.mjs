// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

const UNLISTED = [
  '/lab-privacy',
  '/tools/fuel-planner/results',
  '/tools/fuel-planner/print',
  // Prototype, unlisted until approved.
  '/tools/race-playbooks/isle-of-wight-50k',
];

// https://astro.build/config
export default defineConfig({
  site: 'https://trailhustle.com',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !UNLISTED.some((path) => new URL(page).pathname.replace(/\/$/, '') === path),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
