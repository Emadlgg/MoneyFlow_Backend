const { createClient } = require('@supabase/supabase-js');

// Mock de Supabase para tests
const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    getSession: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }))
};

// Mock global de Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

module.exports = { mockSupabase };

// Variables globales
global.supabase = mockSupabase;

beforeEach(() => {
  jest.clearAllMocks();
});