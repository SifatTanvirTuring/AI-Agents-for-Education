// Create localStorage polyfill BEFORE any imports
if (typeof localStorage === 'undefined') {
  class LocalStorageMock {
    constructor() {
      this.store = {};
    }

    clear() {
      this.store = {};
    }

    getItem(key) {
      return this.store[key] || null;
    }

    setItem(key, value) {
      this.store[key] = String(value);
    }

    removeItem(key) {
      delete this.store[key];
    }

    get length() {
      return Object.keys(this.store).length;
    }

    key(index) {
      const keys = Object.keys(this.store);
      return keys[index] || null;
    }

    // Make it iterable like real localStorage
    *[Symbol.iterator]() {
      for (let key in this.store) {
        if (this.store.hasOwnProperty(key)) {
          yield key;
        }
      }
    }
  }

  // Create the mock instances
  const localStorageMock = new LocalStorageMock();
  const sessionStorageMock = new LocalStorageMock();

  // Assign to global
  global.localStorage = localStorageMock;
  global.sessionStorage = sessionStorageMock;
  globalThis.localStorage = localStorageMock;
  globalThis.sessionStorage = sessionStorageMock;
}

import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};

// Reset storage before each test
beforeEach(() => {
  if (global.localStorage) {
    global.localStorage.clear();
  }
  if (global.sessionStorage) {
    global.sessionStorage.clear();
  }
});