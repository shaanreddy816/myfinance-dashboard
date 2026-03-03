import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setCurrentUserEmail, isAuthenticated, currentUserEmail } from './supabaseClient.js';

describe('Supabase Client', () => {
  beforeEach(() => {
    // Reset current user email before each test
    setCurrentUserEmail('');
  });

  describe('setCurrentUserEmail', () => {
    it('should set the current user email', () => {
      setCurrentUserEmail('test@example.com');
      expect(currentUserEmail).toBe('test@example.com');
    });

    it('should update the current user email', () => {
      setCurrentUserEmail('first@example.com');
      expect(currentUserEmail).toBe('first@example.com');
      
      setCurrentUserEmail('second@example.com');
      expect(currentUserEmail).toBe('second@example.com');
    });

    it('should handle empty string', () => {
      setCurrentUserEmail('test@example.com');
      setCurrentUserEmail('');
      expect(currentUserEmail).toBe('');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user is set', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true when user email is set', () => {
      setCurrentUserEmail('test@example.com');
      expect(isAuthenticated()).toBe(true);
    });

    it('should return false after clearing user email', () => {
      setCurrentUserEmail('test@example.com');
      expect(isAuthenticated()).toBe(true);
      
      setCurrentUserEmail('');
      expect(isAuthenticated()).toBe(false);
    });
  });
});
