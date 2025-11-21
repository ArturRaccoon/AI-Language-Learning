/**
 * FILE: src/setupTests.js
 * CREATION DATE: 2025-11-18
 * DESCRIPTION: Setup file for vitest and testing-library.
 */

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Clean DOM after each test
afterEach(() => {
  cleanup();
});


