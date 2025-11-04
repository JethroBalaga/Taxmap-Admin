/// <reference types="vitest" />
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Check if building for Electron
const isElectron = process.env.ELECTRON === 'true';

export default defineConfig({
  plugins: [
    react(),
    // Completely disable legacy plugin for Electron builds
    isElectron ? null : legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true
    })
  ].filter(Boolean),
  base: "./",
  
  build: {
    target: isElectron ? 'esnext' : 'es2015',
    // Add these settings to prevent legacy chunk issues
    rollupOptions: {
      output: {
        // Don't create legacy chunks for Electron
        manualChunks: undefined
      }
    }
  },
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})