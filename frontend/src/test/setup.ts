import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// 清理 DOM
afterEach(() => {
  cleanup();
});

// 擴充套件 expect matchers
expect.extend({});
