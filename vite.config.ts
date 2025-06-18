import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        },
        includeAssets: [
          'assets/icons/favicon.ico',
          'assets/icons/icon-apple.png',
          'assets/icons/icon-192.png',
          'assets/icons/icon-512.png',
        ],
        manifest: {
          name: 'Board Game Timer',
          short_name: 'BoardTimer',
          description:
            'An application to manage individual player timers for board games and track overall session time. Supports multiple players and configurable session duration.',
          theme_color: '#0369a1',
          background_color: '#f1f5f9',
          icons: [
            {
              src: 'assets/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'assets/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    base: '/board-game-timer/',
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
