/**
 * FILE: src/services/flashcardService.test.js
 * LAST MODIFIED: 25 Dicembre 2025 - 16:55 (CET)
 * DESCRIPTION: Unit tests for the SM-2 SRS algorithm logic.
 */

import { describe, it, expect, vi } from 'vitest';

// Mock Firebase modules to prevent real network calls and config errors
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => {
  const GoogleAuthProviderMock = vi.fn();
  GoogleAuthProviderMock.prototype.setCustomParameters = vi.fn();
  
  return {
    getAuth: vi.fn(),
    GoogleAuthProvider: GoogleAuthProviderMock,
    setPersistence: vi.fn(() => Promise.resolve()),
    browserLocalPersistence: 'TEST_PERSISTENCE',
    signInWithPopup: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  enableIndexedDbPersistence: vi.fn(() => Promise.resolve()),
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  getDoc: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
}));

import { calculateSRSParameters } from './flashcardService';

// Fix system time for deterministic nextReview calculation
vi.setSystemTime(new Date('2025-01-01T10:00:00Z'));

const daysFromNow = (days) => {
  const date = new Date('2025-01-01T10:00:00Z');
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

describe('flashcardService - calculateSRSParameters (SM-2 Logic)', () => {
  const baseCard = {
    easiness: 2.5,
    interval: 1,
    reviewCount: 0,
    knowledgeLevel: 1
  };

  it('Quality 5 (easy) - first review (reviewCount 0)', () => {
    const card = { ...baseCard, reviewCount: 0 };
    const quality = 5;
    const result = calculateSRSParameters(card, quality, new Date('2025-01-01T10:00:00Z'));

    expect(result.reviewCount).toBe(1);
    expect(result.easiness).toBeCloseTo(2.6, 5);
    expect(result.interval).toBe(1);
    expect(result.knowledgeLevel).toBe(3);
    expect(result.nextReview).toBe(daysFromNow(1));
  });

  it('Quality 5 (easy) - second review (reviewCount 1)', () => {
    const card = { ...baseCard, reviewCount: 1, easiness: 2.6, interval: 1 };
    const quality = 5;
    const result = calculateSRSParameters(card, quality, new Date('2025-01-01T10:00:00Z'));

    expect(result.reviewCount).toBe(2);
    expect(result.easiness).toBeCloseTo(2.7, 5);
    expect(result.interval).toBe(6);
    expect(result.knowledgeLevel).toBe(3);
    expect(result.nextReview).toBe(daysFromNow(6));
  });

  it('Quality 5 (easy) - third review (reviewCount 2)', () => {
    const card = { ...baseCard, reviewCount: 2, easiness: 2.7, interval: 6 };
    const quality = 5;
    const result = calculateSRSParameters(card, quality, new Date('2025-01-01T10:00:00Z'));

    expect(result.reviewCount).toBe(3);
    expect(result.easiness).toBeCloseTo(2.8, 5);
    expect(result.interval).toBe(17);
    expect(result.knowledgeLevel).toBe(3);
    expect(result.nextReview).toBe(daysFromNow(17));
  });

  it('Quality 3 (hard) - subsequent review', () => {
    const card = { ...baseCard, reviewCount: 3, easiness: 2.5, interval: 10 };
    const quality = 3;
    const result = calculateSRSParameters(card, quality, new Date('2025-01-01T10:00:00Z'));

    expect(result.reviewCount).toBe(4);
    expect(result.easiness).toBeCloseTo(2.36, 2);
    expect(result.interval).toBe(24);
    expect(result.knowledgeLevel).toBe(2);
    expect(result.nextReview).toBe(daysFromNow(24));
  });

  it('Quality 0 (blackout) - reset interval and reviewCount', () => {
    const card = { ...baseCard, reviewCount: 5, easiness: 2.5, interval: 20 };
    const quality = 0;
    const result = calculateSRSParameters(card, quality, new Date('2025-01-01T10:00:00Z'));

    expect(result.reviewCount).toBe(0);
    expect(result.easiness).toBeCloseTo(1.7, 2);
    expect(result.interval).toBe(1);
    expect(result.knowledgeLevel).toBe(2);
    expect(result.nextReview).toBe(daysFromNow(1));
  });

  it('Quality 1 (wrong) - reset interval and reviewCount', () => {
    const card = { ...baseCard, reviewCount: 3, easiness: 2.2, interval: 15 };
    const quality = 1;
    const result = calculateSRSParameters(card, quality, new Date('2025-01-01T10:00:00Z'));

    expect(result.reviewCount).toBe(0);
    expect(result.easiness).toBeCloseTo(1.66, 2);
    expect(result.interval).toBe(1);
    expect(result.knowledgeLevel).toBe(2);
    expect(result.nextReview).toBe(daysFromNow(1));
  });

  it('Easiness factor never drops below 1.3', () => {
    const card = { ...baseCard, reviewCount: 5, easiness: 1.3, interval: 20 };
    const quality = 0;
    const result = calculateSRSParameters(card, quality, new Date('2025-01-01T10:00:00Z'));

    expect(result.easiness).toBe(1.3);
  });
});


