/// <reference types="vitest" />
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Check if building for Electron
const isElectron = process.env.ELECTRON === 'true';

export default defineConfig({
  plugins: [
    react(),
    // Conditionally disable legacy plugin for Electron
    isElectron ? null : legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true
    })
  ].filter(Boolean),
  base: "/",
  
  build: {
    target: isElectron ? 'es2020' : 'es2015'
  },
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})