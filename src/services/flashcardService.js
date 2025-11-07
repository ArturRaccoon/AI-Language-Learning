/**
 * FILE: src/services/flashcardService.js
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Flashcard CRUD operations with SM-2 spaced repetition algorithm
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const FLASHCARD_COLLECTION = 'flashcards';
const PAGE_LIMIT = 20;
const STUDY_SESSION_LIMIT = 20;

/**
 * CREATE new flashcard
 */
export async function createFlashcard(userId, flashcardData) {
  try {
    const docRef = await addDoc(collection(db, FLASHCARD_COLLECTION), {
      userId: userId,
      originalWord: flashcardData.originalWord.trim(),
      translation: flashcardData.translation.trim(),
      originalLanguage: flashcardData.originalLanguage || 'en-US',
      translationLanguage: flashcardData.translationLanguage || 'it-IT',
      notes: flashcardData.notes || '',
      category: flashcardData.category || 'general',
      createdAt: new Date().toISOString(),
      
      // SRS fields (SuperMemo 2)
      knowledgeLevel: 1,
      lastReview: null,
      nextReview: new Date().toISOString(), // Available immediately
      reviewCount: 0,
      easiness: 2.5,
      interval: 1,
    });
    
    console.log('✅ Flashcard created with ID:', docRef.id);
    
    return { 
      success: true, 
      id: docRef.id, 
      data: { 
        id: docRef.id, 
        ...flashcardData 
      } 
    };
  } catch (error) {
    console.error("❌ Flashcard creation error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * GET flashcards with pagination (for dashboard)
 */
export async function getFlashcards(userId, lastDocument = null) {
  try {
    let q = query(
      collection(db, FLASHCARD_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(PAGE_LIMIT)
    );
    
    if (lastDocument) {
      q = query(
        collection(db, FLASHCARD_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDocument),
        limit(PAGE_LIMIT)
      );
    }
    
    const snapshot = await getDocs(q);
    const flashcards = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = flashcards.length === PAGE_LIMIT;
    
    console.log(`✅ Retrieved ${flashcards.length} flashcards`);
    
    return { 
      success: true, 
      data: flashcards,
      lastDocument: lastVisible,
      hasMore
    };
  } catch (error) {
    console.error("❌ Flashcard retrieval error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * GET flashcards FOR REVIEW (only due today)
 */
export async function getFlashcardsForReview(userId, maxLimit = STUDY_SESSION_LIMIT) {
  try {
    const today = new Date().toISOString();
    
    console.log('🔍 Searching cards for review...');
    console.log('  - User:', userId);
    console.log('  - Date limit:', today);
    console.log('  - Max limit:', maxLimit);
    
    const q = query(
      collection(db, FLASHCARD_COLLECTION),
      where('userId', '==', userId),
      where('nextReview', '<=', today),
      orderBy('nextReview', 'asc'),
      limit(maxLimit)
    );
    
    const snapshot = await getDocs(q);
    const flashcards = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    console.log(`✅ ${flashcards.length} flashcards due for review today`);
    
    // Log card details
    flashcards.forEach((card, idx) => {
      console.log(`  ${idx + 1}. ${card.originalWord} (next: ${card.nextReview})`);
    });
    
    return { 
      success: true, 
      data: flashcards,
      total: flashcards.length
    };
  } catch (error) {
    console.error("❌ Review retrieval error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * RECORD REVIEW - Implements SM-2 algorithm
 * @param {string} flashcardId - Flashcard ID
 * @param {number} quality - Response quality (0-5)
 *   0 = Complete blackout
 *   1 = Wrong answer but remembered after seeing solution
 *   2 = Wrong answer but seemed familiar
 *   3 = Correct answer with difficulty
 *   4 = Correct answer with hesitation
 *   5 = Perfect answer
 */
export async function recordReview(flashcardId, quality) {
  try {
    console.log('🔵 Recording review');
    console.log('  - Card ID:', flashcardId);
    console.log('  - Quality:', quality);
    
    // Retrieve current flashcard
    const flashcardRef = doc(db, FLASHCARD_COLLECTION, flashcardId);
    const flashcardSnap = await getDoc(flashcardRef);
    
    if (!flashcardSnap.exists()) {
      throw new Error('Flashcard not found');
    }
    
    const flashcard = flashcardSnap.data();
    
    console.log('📦 Current flashcard data:');
    console.log('  - Easiness:', flashcard.easiness);
    console.log('  - Interval:', flashcard.interval);
    console.log('  - Review count:', flashcard.reviewCount);
    
    // SM-2 Algorithm (SuperMemo 2)
    let { easiness = 2.5, interval = 1, reviewCount = 0 } = flashcard;
    
    // Calculate new easiness (EF - Easiness Factor)
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easiness = Math.max(1.3, easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    console.log('📊 New easiness calculated:', easiness);
    
    // Calculate new interval
    if (quality < 3) {
      // Wrong answer: restart from 1 day
      interval = 1;
      console.log('❌ Wrong answer → Interval reset to 1 day');
    } else {
      // Correct answer: increase interval
      if (reviewCount === 0) {
        interval = 1;
      } else if (reviewCount === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easiness);
      }
      console.log('✅ Correct answer → New interval:', interval, 'days');
    }
    
    // Calculate next review
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
    // Calculate knowledge level (1-5)
    const newLevel = Math.min(5, Math.max(1, Math.round(easiness)));
    
    console.log('📅 Next review:', nextReview.toISOString());
    console.log('⭐ New knowledge level:', newLevel);
    
    // Update document
    await updateDoc(flashcardRef, {
      easiness,
      interval,
      reviewCount: reviewCount + 1,
      knowledgeLevel: newLevel,
      lastReview: new Date().toISOString(),
      nextReview: nextReview.toISOString()
    });
    
    console.log('✅ Review recorded successfully');
    
    return { 
      success: true, 
      nextReview: nextReview.toISOString(),
      interval,
      knowledgeLevel: newLevel
    };
  } catch (error) {
    console.error("❌ Review recording error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * UPDATE existing flashcard
 */
export async function updateFlashcard(flashcardId, newData) {
  try {
    const docRef = doc(db, FLASHCARD_COLLECTION, flashcardId);
    await updateDoc(docRef, {
      ...newData,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Flashcard updated:', flashcardId);
    return { success: true };
  } catch (error) {
    console.error("❌ Flashcard update error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * DELETE flashcard
 */
export async function deleteFlashcard(flashcardId) {
  try {
    await deleteDoc(doc(db, FLASHCARD_COLLECTION, flashcardId));
    
    console.log('🗑️ Flashcard deleted:', flashcardId);
    return { success: true };
  } catch (error) {
    console.error("❌ Flashcard deletion error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * USER STATISTICS - For dashboard and widgets
 */
export async function getStatistics(userId) {
  try {
    console.log('📊 Calculating statistics for:', userId);
    
    const q = query(
      collection(db, FLASHCARD_COLLECTION),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const flashcards = snapshot.docs.map(doc => doc.data());
    
    const today = new Date().toISOString();
    
    const statistics = {
      total: flashcards.length,
      dueForReview: flashcards.filter(f => f.nextReview <= today).length,
      new: flashcards.filter(f => f.reviewCount === 0).length,
      mastered: flashcards.filter(f => f.knowledgeLevel >= 4).length,
      averageReviews: flashcards.length > 0 
        ? Math.round(flashcards.reduce((sum, f) => sum + (f.reviewCount || 0), 0) / flashcards.length)
        : 0,
      
      // Additional statistics
      byLevel: {
        level1: flashcards.filter(f => f.knowledgeLevel === 1).length,
        level2: flashcards.filter(f => f.knowledgeLevel === 2).length,
        level3: flashcards.filter(f => f.knowledgeLevel === 3).length,
        level4: flashcards.filter(f => f.knowledgeLevel === 4).length,
        level5: flashcards.filter(f => f.knowledgeLevel === 5).length,
      }
    };
    
    console.log('📊 Statistics calculated:', statistics);
    
    return { success: true, data: statistics };
  } catch (error) {
    console.error("❌ Statistics calculation error:", error);
    return { success: false, error: error.message };
  }
}
