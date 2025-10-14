import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node', // Use node environment with our own localStorage mock
    setupFiles: './tests/setup.js',
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    // Handle module resolution issues
    server: {
      deps: {
        inline: ['@testing-library/react', '@testing-library/jest-dom', 'react', 'react-dom']
      }
    },
    // Add transform options for JSX
    transformMode: {
      web: [/\.[jt]sx?$/]
    },
    // Ensure setup files run before test files
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'services/**/*.js',
        'components/**/*.jsx',
        '*.js',
        '*.jsx'
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        '*.test.js',
        '*.test.jsx',
        'vite.config.js',
        'vitest.config.js',
        'postcss.config.js',
        'tailwind.config.js'
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  },
  // Add esbuild options for JSX
  esbuild: {
    jsx: 'automatic'
  }
});
