const authService = require('../../services/authService');

describe('Auth Service - Real Implementation', () => {
  describe('User Registration', () => {
    test('should handle sign up with valid data', async () => {
      // Mock successful response
      global.supabase.auth.signUp.mockResolvedValueOnce({
        data: { 
          user: { 
            id: 'user-123',
            email: 'test@example.com',
            created_at: new Date().toISOString()
          }
        },
        error: null
      });

      const result = await authService.signUp(
        'test@example.com', 
        'password123',
        { name: 'Test User' }
      );

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('test@example.com');
      expect(global.supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { name: 'Test User' }
        }
      });
    });

    test('should handle sign up error', async () => {
      global.supabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Email already registered' }
      });

      const result = await authService.signUp('existing@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });
  });

  describe('User Authentication', () => {
    test('should sign in with valid credentials', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'mock-jwt-token'
      };

      global.supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { 
          session: mockSession,
          user: mockSession.user 
        },
        error: null
      });

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.session.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });

    test('should handle invalid credentials', async () => {
      global.supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Invalid login credentials' }
      });

      const result = await authService.signIn('wrong@example.com', 'wrongpass');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid login credentials');
    });
  });

  describe('User Session Management', () => {
    test('should sign out successfully', async () => {
      global.supabase.auth.signOut.mockResolvedValueOnce({
        error: null
      });

      const result = await authService.signOut();

      expect(result.success).toBe(true);
      expect(global.supabase.auth.signOut).toHaveBeenCalled();
    });

    test('should get current user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      global.supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      });

      const result = await authService.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('test@example.com');
    });
  });
});