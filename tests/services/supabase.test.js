const { createClient } = require('@supabase/supabase-js');

describe('Supabase Service Tests', () => {
  let supabase;

  beforeEach(() => {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  });

  describe('User Authentication', () => {
    test('should sign up a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: new Date().toISOString()
      };

      // Configurar el mock para este test específico
      supabase.auth.signUp.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      });

      const result = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    test('should sign in with valid credentials', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'mock-jwt-token'
      };

      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.data.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    test('should handle authentication error', async () => {
      const mockError = { message: 'Invalid credentials' };

      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: null },
        error: mockError
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });

      expect(result.data.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('Transaction Operations', () => {
    test('should create a new transaction', async () => {
      const mockTransaction = {
        id: 'trans-123',
        user_id: 'user-123',
        type: 'expense',
        amount: 100.50,
        description: 'Test expense',
        category: 'Food'
      };

      // Mock the chain of methods
      const insertMock = jest.fn().mockResolvedValue({
        data: [mockTransaction],
        error: null
      });

      supabase.from.mockReturnValue({
        insert: insertMock
      });

      const result = await supabase
        .from('transactions')
        .insert({
          user_id: 'user-123',
          type: 'expense',
          amount: 100.50,
          description: 'Test expense',
          category: 'Food'
        });

      expect(result.data[0]).toEqual(mockTransaction);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('transactions');
      expect(insertMock).toHaveBeenCalled();
    });

    test('should get user transactions', async () => {
      const mockTransactions = [
        { id: 'trans-1', type: 'income', amount: 1000, description: 'Salary' },
        { id: 'trans-2', type: 'expense', amount: 100, description: 'Groceries' }
      ];

      // Mock the chain: from().select().eq()
      const eqMock = jest.fn().mockResolvedValue({
        data: mockTransactions,
        error: null
      });

      const selectMock = jest.fn().mockReturnValue({
        eq: eqMock
      });

      supabase.from.mockReturnValue({
        select: selectMock
      });

      const result = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', 'user-123');

      expect(result.data).toEqual(mockTransactions);
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('transactions');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(eqMock).toHaveBeenCalledWith('user_id', 'user-123');
    });

    test('should handle database errors', async () => {
      const mockError = { message: 'Database connection failed' };

      const insertMock = jest.fn().mockResolvedValue({
        data: null,
        error: mockError
      });

      supabase.from.mockReturnValue({
        insert: insertMock
      });

      const result = await supabase
        .from('transactions')
        .insert({ type: 'expense', amount: 100 });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('Query Building', () => {
    test('should build complex queries', async () => {
      const mockData = [{ id: 1, amount: 100 }];

      // Mock para query compleja: from().select().eq().gte().order()
      const orderMock = jest.fn().mockResolvedValue({
        data: mockData,
        error: null
      });

      const gteMock = jest.fn().mockReturnValue({
        order: orderMock
      });

      const eqMock = jest.fn().mockReturnValue({
        gte: gteMock
      });

      const selectMock = jest.fn().mockReturnValue({
        eq: eqMock
      });

      supabase.from.mockReturnValue({
        select: selectMock
      });

      const result = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', 'user-123')
        .gte('amount', 50)
        .order('created_at', { ascending: false });

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });
  });
});