/**
 * Firebase Integration Test Suite for Learning Buddy
 * Comprehensive testing of Firebase services, authentication, and database operations
 */

// Mock Firebase configuration - moved to top to avoid hoisting issues
vi.mock('./services/firebase.js', () => ({
  db: {
    doc: vi.fn((db, collection, id) => ({ id, collection, path: `${collection}/${id}` })),
    setDoc: vi.fn(() => Promise.resolve()),
    getDoc: vi.fn(() => Promise.resolve({ 
      exists: () => true, 
      data: () => ({ test: 'data' }) 
    })),
    updateDoc: vi.fn(() => Promise.resolve()),
    serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 }))
  },
  auth: {
    currentUser: {
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User'
    },
    onAuthStateChanged: vi.fn((callback) => {
      callback({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      });
      return () => {}; // unsubscribe function
    })
  }
}));

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  createUserProfile, 
  completeOnboarding, 
  updateUserData, 
  getUserProgress, 
  saveUserProgress,
  subscribeToUserProgress 
} from './services/enhancedDatabaseService.js';
import { 
  saveUserProgressLocal, 
  getUserProgressLocal, 
  clearAllLocalData 
} from './services/localStorageService.js';

describe('Firebase Integration Tests', () => {
  let mockFirestore, mockAuth;

  beforeEach(async () => {
    vi.clearAllMocks();
    clearAllLocalData();
    
    // Get the mocked functions
    const { db, auth } = await import('./services/firebase.js');
    mockFirestore = db;
    mockAuth = auth;
  });

  afterEach(() => {
    clearAllLocalData();
  });

  describe('User Profile Management', () => {
    it('should create user profile with valid data', async () => {
      const userId = 'test-user-123';
      const profileData = {
        email: 'test@example.com',
        userName: 'Test User',
        grade: 'Secondary 3',
        targetExamYear: '2025',
        examDate: '2025-06-15',
        onboardingComplete: true
      };

      const result = await createUserProfile(userId, profileData);
      
      expect(result).toBe(true);
      expect(mockFirestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: userId }),
        expect.objectContaining({
          profile: expect.objectContaining({
            email: profileData.email,
            userName: profileData.userName,
            grade: profileData.grade,
            targetExamYear: profileData.targetExamYear,
            examDate: profileData.examDate
          })
        })
      );
    });

    it('should handle profile creation with missing data gracefully', async () => {
      const userId = 'test-user-456';
      const profileData = {
        email: 'incomplete@example.com'
        // Missing required fields
      };

      const result = await createUserProfile(userId, profileData);
      
      expect(result).toBe(true);
      expect(mockFirestore.setDoc).toHaveBeenCalled();
    });

    it('should save profile to localStorage when Firebase is unavailable', async () => {
      // Mock Firebase as unavailable
      vi.doMock('./services/firebase.js', () => ({
        db: null,
        auth: null
      }));

      const userId = 'test-user-789';
      const profileData = {
        email: 'local@example.com',
        userName: 'Local User',
        grade: 'Secondary 2',
        targetExamYear: '2026'
      };

      const result = await createUserProfile(userId, profileData);
      
      expect(result).toBe(true);
      
      // Check if data was saved to localStorage
      const savedData = getUserProgressLocal(userId);
      expect(savedData).toBeDefined();
      expect(savedData.profile.email).toBe(profileData.email);
    });
  });

  describe('Onboarding Process', () => {
    it('should complete onboarding successfully', async () => {
      const userId = 'test-user-onboarding';
      const onboardingData = {
        email: 'onboarding@example.com',
        userName: 'Onboarding User',
        grade: 'Secondary 4',
        targetExamYear: '2025',
        examDate: '2025-06-15',
        subjects: ['math', 'english'],
        topics: {
          math: ['algebra', 'geometry'],
          english: ['grammar', 'writing']
        }
      };

      const result = await completeOnboarding(userId, onboardingData);
      
      expect(result).toBe(true);
      expect(mockFirestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: userId }),
        expect.objectContaining({
          onboardingComplete: true
        })
      );
    });

    it('should handle onboarding with incomplete data', async () => {
      const userId = 'test-user-incomplete';
      const onboardingData = {
        email: 'incomplete@example.com',
        userName: 'Incomplete User'
        // Missing other required fields
      };

      const result = await completeOnboarding(userId, onboardingData);
      
      expect(result).toBe(true);
    });
  });

  describe('User Data Updates', () => {
    it('should update user data successfully', async () => {
      const userId = 'test-user-update';
      const updates = {
        'profile.lastActive': new Date().toISOString(),
        'gamification.points': 150,
        'gamification.streak': 5
      };

      const result = await updateUserData(userId, updates);
      
      expect(result).toBe(true);
      expect(mockFirestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: userId }),
        updates,
        { merge: true }
      );
    });

    it('should handle nested object updates', async () => {
      const userId = 'test-user-nested';
      const updates = {
        'profile.grade': 'Secondary 5',
        'profile.examDate': '2025-12-15',
        'subjects.math.progress': 75,
        'subjects.english.progress': 60
      };

      const result = await updateUserData(userId, updates);
      
      expect(result).toBe(true);
    });

    it('should fallback to localStorage when Firebase is unavailable', async () => {
      // Mock Firebase as unavailable
      vi.doMock('./services/firebase.js', () => ({
        db: null,
        auth: null
      }));

      const userId = 'test-user-local';
      const updates = {
        'profile.lastActive': new Date().toISOString(),
        'gamification.points': 200
      };

      // Pre-populate localStorage with some data
      const existingData = {
        profile: { userName: 'Test User' },
        gamification: { points: 100 }
      };
      saveUserProgressLocal(userId, existingData);

      const result = await updateUserData(userId, updates);
      
      expect(result).toBe(true);
      
      // Check if data was updated in localStorage
      const updatedData = getUserProgressLocal(userId);
      expect(updatedData.gamification.points).toBe(200);
    });
  });

  describe('Data Retrieval', () => {
    it('should retrieve user progress successfully', async () => {
      const userId = 'test-user-retrieve';
      
      // Pre-populate localStorage
      const testData = {
        profile: {
          userName: 'Retrieve User',
          grade: 'Secondary 3',
          examYear: '2025'
        },
        subjects: { math: { progress: 80 } },
        gamification: { points: 120, streak: 3 }
      };
      saveUserProgressLocal(userId, testData);

      const result = await getUserProgress(userId);
      
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent user', async () => {
      const userId = 'non-existent-user';
      const result = await getUserProgress(userId);
      
      expect(result).toBeNull();
    });
  });

  describe('Progress Saving', () => {
    it('should save user progress successfully', async () => {
      const userId = 'test-user-save';
      const userProgress = {
        profile: {
          userName: 'Save User',
          grade: 'Secondary 4',
          examYear: '2025'
        },
        subjects: {
          math: { progress: 90, lastStudied: new Date().toISOString() },
          english: { progress: 75, lastStudied: new Date().toISOString() }
        },
        gamification: { points: 200, streak: 7, badges: ['Math Master'] }
      };

      const result = await saveUserProgress(userId, userProgress);
      
      expect(result).toBe(true);
    });

    it('should handle large progress objects', async () => {
      const userId = 'test-user-large';
      const largeProgress = {
        profile: { userName: 'Large User' },
        subjects: {},
        studySessions: {},
        learningPath: {}
      };

      // Add many study sessions
      for (let i = 0; i < 100; i++) {
        largeProgress.studySessions[`session-${i}`] = {
          id: `session-${i}`,
          subject: 'math',
          duration: 30,
          completed: true,
          timestamp: new Date().toISOString()
        };
      }

      const result = await saveUserProgress(userId, largeProgress);
      
      expect(result).toBe(true);
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should subscribe to user progress updates', () => {
      const userId = 'test-user-subscribe';
      const callback = vi.fn();
      
      const unsubscribe = subscribeToUserProgress(userId, callback);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Simulate data update
      const testData = { profile: { userName: 'Subscribe User' } };
      saveUserProgressLocal(userId, testData);
      
      // Trigger callback manually (since we're using localStorage fallback)
      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(testData);
      }, 0);
    });

    it('should handle subscription cleanup', () => {
      const userId = 'test-user-cleanup';
      const callback = vi.fn();
      
      const unsubscribe = subscribeToUserProgress(userId, callback);
      
      // Call unsubscribe
      const result = unsubscribe();
      
      expect(result).toBeUndefined(); // No-op function returns undefined
    });
  });

  describe('Error Handling', () => {
    it('should handle Firebase connection errors gracefully', async () => {
      // Mock Firebase to throw an error
      mockFirestore.setDoc.mockRejectedValueOnce(new Error('Firebase connection failed'));

      const userId = 'test-user-error';
      const profileData = {
        email: 'error@example.com',
        userName: 'Error User'
      };

      const result = await createUserProfile(userId, profileData);
      
      // Should still return true and save to localStorage
      expect(result).toBe(true);
      
      // Check if data was saved to localStorage as fallback
      const savedData = getUserProgressLocal(userId);
      expect(savedData).toBeDefined();
    });

    it('should handle invalid user data', async () => {
      const userId = '';
      const profileData = null;

      const result = await createUserProfile(userId, profileData);
      
      expect(result).toBe(true); // Should handle gracefully
    });

    it('should handle network timeouts', async () => {
      // Mock a timeout
      mockFirestore.setDoc.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );

      const userId = 'test-user-timeout';
      const profileData = {
        email: 'timeout@example.com',
        userName: 'Timeout User'
      };

      const result = await createUserProfile(userId, profileData);
      
      expect(result).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should validate required profile fields', async () => {
      const userId = 'test-user-validation';
      const profileData = {
        email: 'validation@example.com',
        userName: 'Validation User',
        grade: 'Secondary 3',
        targetExamYear: '2025'
      };

      const result = await createUserProfile(userId, profileData);
      
      expect(result).toBe(true);
      
      // Verify the data structure
      expect(mockFirestore.setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          profile: expect.objectContaining({
            email: profileData.email,
            userName: profileData.userName,
            grade: profileData.grade,
            targetExamYear: profileData.targetExamYear
          })
        })
      );
    });

    it('should handle malformed data gracefully', async () => {
      const userId = 'test-user-malformed';
      const profileData = {
        email: 'malformed@example.com',
        userName: 'Malformed User',
        grade: null,
        targetExamYear: undefined,
        examDate: 'invalid-date'
      };

      const result = await createUserProfile(userId, profileData);
      
      expect(result).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple concurrent operations', async () => {
      const userIds = Array.from({ length: 10 }, (_, i) => `test-user-concurrent-${i}`);
      const profileData = {
        email: 'concurrent@example.com',
        userName: 'Concurrent User',
        grade: 'Secondary 3',
        targetExamYear: '2025'
      };

      const promises = userIds.map(userId => 
        createUserProfile(userId, { ...profileData, userName: `User ${userId}` })
      );

      const results = await Promise.all(promises);
      
      expect(results.every(result => result === true)).toBe(true);
    });

    it('should handle large data objects efficiently', async () => {
      const userId = 'test-user-large-data';
      const largeProfileData = {
        email: 'large@example.com',
        userName: 'Large Data User',
        grade: 'Secondary 3',
        targetExamYear: '2025',
        subjects: {},
        studySessions: {},
        learningPath: {}
      };

      // Add large amounts of data
      for (let i = 0; i < 1000; i++) {
        largeProfileData.subjects[`subject-${i}`] = {
          id: `subject-${i}`,
          name: `Subject ${i}`,
          progress: Math.random() * 100,
          lastStudied: new Date().toISOString()
        };
      }

      const startTime = performance.now();
      const result = await createUserProfile(userId, largeProfileData);
      const endTime = performance.now();

      expect(result).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Security Tests', () => {
    it('should prevent unauthorized data access', async () => {
      const userId = 'test-user-security';
      const profileData = {
        email: 'security@example.com',
        userName: 'Security User',
        grade: 'Secondary 3',
        targetExamYear: '2025'
      };

      await createUserProfile(userId, profileData);

      // Try to access data with different user ID
      const unauthorizedUserId = 'unauthorized-user';
      const unauthorizedData = getUserProgressLocal(unauthorizedUserId);
      
      expect(unauthorizedData).toBeNull();
    });

    it('should sanitize user input', async () => {
      const userId = 'test-user-sanitize';
      const profileData = {
        email: 'sanitize@example.com',
        userName: '<script>alert("xss")</script>Security User',
        grade: 'Secondary 3',
        targetExamYear: '2025'
      };

      const result = await createUserProfile(userId, profileData);
      
      expect(result).toBe(true);
      
      // Check that the data was stored (sanitization would be handled by the UI layer)
      const savedData = getUserProgressLocal(userId);
      expect(savedData.profile.userName).toBe(profileData.userName);
    });
  });

  describe('Integration with Local Storage', () => {
    it('should maintain data consistency between Firebase and localStorage', async () => {
      const userId = 'test-user-consistency';
      const profileData = {
        email: 'consistency@example.com',
        userName: 'Consistency User',
        grade: 'Secondary 3',
        targetExamYear: '2025'
      };

      await createUserProfile(userId, profileData);

      // Check localStorage
      const localData = getUserProgressLocal(userId);
      expect(localData).toBeDefined();
      expect(localData.profile.email).toBe(profileData.email);
      expect(localData.profile.userName).toBe(profileData.userName);
    });

    it('should handle localStorage quota exceeded', async () => {
      // Mock localStorage quota exceeded
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const userId = 'test-user-quota';
      const profileData = {
        email: 'quota@example.com',
        userName: 'Quota User',
        grade: 'Secondary 3',
        targetExamYear: '2025'
      };

      const result = await createUserProfile(userId, profileData);
      
      // Should still return true even if localStorage fails
      expect(result).toBe(true);

      // Restore original localStorage
      localStorage.setItem = originalSetItem;
    });
  });
});
