/**
 * Simplified Integration Tests for Learning Buddy Application
 * Tests core functionality without complex React component rendering
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  saveUserProgressLocal, 
  getUserProgressLocal, 
  clearAllLocalData 
} from './services/localStorageService.js';
import { 
  createUserProfile, 
  completeOnboarding, 
  getUserProgress 
} from './services/enhancedDatabaseService.js';

// Mock Firebase services
vi.mock('./services/firebase.js', () => ({
  db: null, // Force Firebase to be unavailable so it falls back to localStorage
  auth: null
}));

// Mock Gemini service
vi.mock('./services/geminiService.js', () => ({
  generateEvaluationQuiz: vi.fn(() => Promise.resolve([
    {
      id: 'q1',
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      subject: 'math',
      topic: 'arithmetic'
    }
  ])),
  evaluateQuizAnswers: vi.fn(() => Promise.resolve({
    overallScore: 85,
    strengths: ['mathematics'],
    weaknesses: ['english'],
    recommendations: ['Focus on grammar']
  })),
  generateStudyPlan: vi.fn(() => Promise.resolve({
    weeklySchedule: {
      monday: ['Math: Algebra', 'English: Grammar'],
      tuesday: ['Math: Geometry', 'English: Writing']
    },
    milestones: ['Complete algebra basics', 'Improve grammar skills']
  }))
}));

describe('Learning Buddy Integration Tests', () => {
  beforeEach(() => {
    clearAllLocalData();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearAllLocalData();
  });


  describe('User Profile Management', () => {
    it('should create user profile with valid data', async () => {
      const userId = 'test-user-123';
      const profileData = {
        email: 'test@example.com',
        grade: 'Secondary 3',
        targetExamYear: '2025',
        examDate: '2025-06-15',
        onboardingComplete: true,
        profile: {
          userName: 'Test User'
        }
      };

      const result = await createUserProfile(userId, profileData);
      
      expect(result).toBe(true);
    });

    it('should handle profile creation with missing data gracefully', async () => {
      const userId = 'test-user-456';
      const profileData = {
        email: 'incomplete@example.com',
        profile: {
          userName: 'Incomplete User'
        }
        // Missing required fields
      };

      const result = await createUserProfile(userId, profileData);
      
      expect(result).toBe(true);
    });
  });

  describe('Onboarding Process', () => {
    it('should complete onboarding successfully', async () => {
      const userId = 'test-user-onboarding';
      const onboardingData = {
        email: 'onboarding@example.com',
        grade: 'Secondary 4',
        targetExamYear: '2025',
        examDate: '2025-06-15',
        subjects: ['math', 'english'],
        topics: {
          math: ['algebra', 'geometry'],
          english: ['grammar', 'writing']
        },
        profile: {
          userName: 'Onboarding User'
        },
        onboardingComplete: true
      };

      const result = await completeOnboarding(userId, onboardingData);
      
      expect(result).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user data gracefully', async () => {
      const userId = 'non-existent-user';
      const result = await getUserProgress(userId);
      
      expect(result).toBeNull();
    });

    it('should handle invalid user data', async () => {
      const userId = '';
      const profileData = {
        email: 'test@example.com',
        profile: {
          userName: 'Test User'
        }
      };

      const result = await createUserProfile(userId, profileData);
      
      expect(result).toBe(true); // Should handle gracefully
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = {
        profile: { userName: 'Large User' },
        subjects: {},
        studySessions: {},
        learningPath: {}
      };

      // Add many study sessions
      for (let i = 0; i < 100; i++) {
        largeData.studySessions[`session-${i}`] = {
          id: `session-${i}`,
          subject: 'math',
          duration: 30,
          completed: true,
          timestamp: new Date().toISOString()
        };
      }

      const startTime = performance.now();
      saveUserProgressLocal('test-user-large', largeData);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
