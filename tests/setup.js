const { createClient } = require('@supabase/supabase-js');

// Mock más robusto para Supabase
const createMockQueryBuilder = () => {
  const mockQueryBuilder = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    gte: jest.fn(),
    lte: jest.fn(),
    order: jest.fn(),
    single: jest.fn(),
    limit: jest.fn(),
    offset: jest.fn()
  };

  // Hacer que todos los métodos de query building retornen `this`
  Object.keys(mockQueryBuilder).forEach(key => {
    if (key !== 'single') {
      mockQueryBuilder[key].mockReturnValue(mockQueryBuilder);
    }
  });

  return mockQueryBuilder;
};

const mockSupabaseResponse = {
  data: null,
  error: null
};

const mockSupabase = {
  from: jest.fn(() => createMockQueryBuilder()),
  auth: {
    signUp: jest.fn().mockResolvedValue(mockSupabaseResponse),
    signInWithPassword: jest.fn().mockResolvedValue(mockSupabaseResponse),
    signOut: jest.fn().mockResolvedValue(mockSupabaseResponse),
    getUser: jest.fn().mockResolvedValue(mockSupabaseResponse),
  }
};

// Mock del módulo completo
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

// Variables globales
global.supabase = mockSupabase;
global.mockSupabaseResponse = mockSupabaseResponse;
global.createMockQueryBuilder = createMockQueryBuilder;

beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset mock responses
  mockSupabaseResponse.data = null;
  mockSupabaseResponse.error = null;

  // Recrear el mock de from para cada test
  mockSupabase.from.mockImplementation(() => createMockQueryBuilder());
});

// Environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';