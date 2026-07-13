// Vitest global setup
import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Set up test environment
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Cleanup
});
