/* eslint-disable import/no-extraneous-dependencies */
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig({
  json: {
    stringify: true,
  },

  mode: process.env.MODE,

  optimizeDeps: {
    esbuildOptions: {
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },

  plugins: [
    vue(),
    svgLoader({
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                inlineStyles: false,
                removeAttrs: { attrs: 'class' },
              },
            },
          },
        ],
      },
    }),
  ],

  server: {
    proxy: {
      '^/auth/.*': {
        target: 'http://localhost:8080',
      },
      '^/api/.*': {
        target: 'http://localhost:8080',
      },
    },
  },
});
