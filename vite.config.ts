import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import monkey from 'vite-plugin-monkey';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    monkey({
      entry: 'src/main.ts',
      server: {
        mountGmApi: true,
      },
      userscript: {
        name: 'Video Speed Controller',
        icon: 'https://raw.githubusercontent.com/dongdevcom/video-speed-controller/main/docs/icon.png',
        namespace: 'github@dongdevcom/video-speed-controller',
        author: 'github@dongdevcom',
        match: ['*://*/*'],
        exclude: ['*://*.twitch.tv/*'],
        'run-at': 'document-idle',
        supportURL: 'https://github.com/dongdevcom/video-speed-controller/issues',
        updateURL: 'https://github.com/dongdevcom/video-speed-controller/releases/latest/download/video-speed-controller.user.js',
        downloadURL: 'https://github.com/dongdevcom/video-speed-controller/releases/latest/download/video-speed-controller.user.js',
        description: 'Adjust and remember video speed using keyboard shortcuts',
        license: 'MIT',
      }
    }),
  ],
  resolve: {
    alias: {
      '$': path.resolve('./src'),
      '$lib': path.resolve('./src/lib')
    },
  }
});
