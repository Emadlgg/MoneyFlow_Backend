const AuthService = require('../../services/authService');

// Mock de Supabase para evitar llamadas reales
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn()
    }
  }))
}));

// Obtener la instancia mockeada
const { createClient } = require('@supabase/supabase-js');
const mockSupabase = createClient();

describe('AuthService - Tests Automatizados', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  describe('signIn()', () => {
    test('debe retornar éxito con credenciales válidas', async () => {
      // ARRANGE: Configurar datos de prueba
      const email = 'test@example.com';
      const password = 'password123';
      
      const mockResponse = {
        data: {
          session: { access_token: 'fake-token' },
          user: { id: '123', email: 'test@example.com' }
        },
        error: null
      };

      // Mock de respuesta exitosa
      mockSupabase.auth.signInWithPassword.mockResolvedValue(mockResponse);

      // ACT: Ejecutar la función automáticamente
      const result = await AuthService.signIn(email, password);

      // ASSERT: Verificaciones automáticas
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password
      });
    });

    test('debe retornar error con credenciales inválidas', async () => {
      // ARRANGE: Configurar error
      const email = 'wrong@example.com';
      const password = 'wrongpassword';
      
      const mockResponse = {
        data: { session: null, user: null },
        error: { message: 'Invalid credentials' }
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue(mockResponse);

      // ACT: Ejecutar automáticamente
      const result = await AuthService.signIn(email, password);

      // ASSERT: Verificar manejo de error automáticamente
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(result.session).toBeUndefined();
      expect(result.user).toBeUndefined();
    });
  });

  describe('signUp()', () => {
    test('debe crear usuario correctamente', async () => {
      // ARRANGE
      const email = 'nuevo@example.com';
      const password = 'password123';
      const userData = { name: 'Test User' };

      const mockResponse = {
        data: {
          user: { id: '456', email: 'nuevo@example.com' }
        },
        error: null
      };

      mockSupabase.auth.signUp.mockResolvedValue(mockResponse);

      // ACT
      const result = await AuthService.signUp(email, password, userData);

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email,
        password,
        options: { data: userData }
      });
    });
  });

  describe('getCurrentUser()', () => {
    test('debe obtener usuario actual cuando está autenticado', async () => {
      // ARRANGE
      const mockResponse = {
        data: {
          user: { id: '123', email: 'current@example.com' }
        },
        error: null
      };

      mockSupabase.auth.getUser.mockResolvedValue(mockResponse);

      // ACT
      const result = await AuthService.getCurrentUser();

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('current@example.com');
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });
  });
});