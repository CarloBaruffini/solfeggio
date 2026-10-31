import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

const BACKGROUND = '#2d5b8c';

// Generates the PWA icons in public/ from favicon.svg: `pnpm generate-pwa-assets`.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: BACKGROUND } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: BACKGROUND } },
  },
  images: ['public/favicon.svg'],
});
