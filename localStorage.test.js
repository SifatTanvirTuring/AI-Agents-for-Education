/**
 * LocalStorage Tests for Learning Buddy Application
 * Tests localStorage functionality in isolation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  saveUserProgressLocal, 
  getUserProgressLocal, 
  clearAllLocalData 
} from './services/localStorageService.js';

describe('LocalStorage Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearAllLocalData();
  });

  afterEach(() => {
    // Clear localStorage after each test
    clearAllLocalData();
  });

  describe('Data Persistence', () => {
    it('should save user data to localStorage', () => {
      const testData = {
        profile: {
          userName: 'John Doe',
          grade: 'Secondary 3',
          examYear: '2025',
          examDate: '2025-06-15',
          onboardingComplete: true
        },
        subjects: {},
        evaluation: { overallScore: 85 },
        studyPlan: { weeklySchedule: {} },
        gamification: { points: 100, streak: 1, badges: [] }
      };
      
      const userId = 'test-user-persistence';
      saveUserProgressLocal(userId, testData);
      const retrievedData = getUserProgressLocal(userId);
      
      expect(retrievedData).toEqual(testData);
    });

    it('should retrieve user data from localStorage', () => {
      const testData = {
        profile: {
          userName: 'Test User',
          grade: 'Secondary 3',
          examYear: '2025',
          examDate: '2025-06-15',
          onboardingComplete: true
        }
      };
      
      const userId = 'test-user-retrieve';
      saveUserProgressLocal(userId, testData);
      const retrievedData = getUserProgressLocal(userId);
      
      expect(retrievedData).toEqual(testData);
    });

    it('should return null for non-existent user', () => {
      const userId = 'non-existent-user';
      const retrievedData = getUserProgressLocal(userId);
      
      expect(retrievedData).toBeNull();
    });

    it('should handle multiple users', () => {
      const user1Data = {
        profile: { userName: 'User 1', grade: 'Secondary 3' }
      };
      
      const user2Data = {
        profile: { userName: 'User 2', grade: 'Secondary 4' }
      };
      
      saveUserProgressLocal('user1', user1Data);
      saveUserProgressLocal('user2', user2Data);
      
      const retrievedUser1 = getUserProgressLocal('user1');
      const retrievedUser2 = getUserProgressLocal('user2');
      
      expect(retrievedUser1).toEqual(user1Data);
      expect(retrievedUser2).toEqual(user2Data);
    });

    it('should clear all app data', () => {
      const testData = {
        profile: { userName: 'Test User' }
      };
      
      saveUserProgressLocal('user1', testData);
      saveUserProgressLocal('user2', testData);
      
      // Verify data exists
      expect(getUserProgressLocal('user1')).toEqual(testData);
      expect(getUserProgressLocal('user2')).toEqual(testData);
      
      // Clear all data
      clearAllLocalData();
      
      // Verify data is cleared
      expect(getUserProgressLocal('user1')).toBeNull();
      expect(getUserProgressLocal('user2')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };
      
      const testData = { profile: { userName: 'Test User' } };
      const userId = 'test-user-error';
      
      // Should not throw an error
      expect(() => {
        saveUserProgressLocal(userId, testData);
      }).not.toThrow();
      
      // Restore original localStorage
      localStorage.setItem = originalSetItem;
    });

    it('should handle localStorage getItem errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => {
        throw new Error('Storage access denied');
      };
      
      const userId = 'test-user-error';
      
      // Should return null and not throw
      const result = getUserProgressLocal(userId);
      expect(result).toBeNull();
      
      // Restore original localStorage
      localStorage.getItem = originalGetItem;
    });
  });

  describe('Data Validation', () => {
    it('should handle null data', () => {
      const userId = 'test-user-null';
      saveUserProgressLocal(userId, null);
      
      const retrievedData = getUserProgressLocal(userId);
      expect(retrievedData).toBeNull();
    });

    it('should handle undefined data', () => {
      const userId = 'test-user-undefined';
      saveUserProgressLocal(userId, undefined);
      
      const retrievedData = getUserProgressLocal(userId);
      expect(retrievedData).toBeNull();
    });

    it('should handle empty object', () => {
      const testData = {};
      const userId = 'test-user-empty';
      
      saveUserProgressLocal(userId, testData);
      const retrievedData = getUserProgressLocal(userId);
      
      expect(retrievedData).toEqual(testData);
    });
  });
});
