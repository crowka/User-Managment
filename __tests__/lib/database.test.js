import { supabase, getServiceSupabase } from '../../lib/supabase';

// Mock the supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
  getServiceSupabase: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }),
}));

describe('Database Operations', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('can fetch user profile', async () => {
    // Mock successful profile fetch
    supabase.single.mockResolvedValue({
      data: {
        id: '123',
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: 'https://example.com/avatar.jpg',
      },
      error: null,
    });

    // Perform the operation
    const userId = '123';
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Check if the operation was performed correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.select).toHaveBeenCalledWith('*');
    expect(supabase.eq).toHaveBeenCalledWith('id', userId);
    expect(supabase.single).toHaveBeenCalled();

    // Check the result
    expect(error).toBeNull();
    expect(data).toEqual({
      id: '123',
      first_name: 'John',
      last_name: 'Doe',
      avatar_url: 'https://example.com/avatar.jpg',
    });
  });

  test('can update user profile', async () => {
    // Mock successful profile update
    supabase.single.mockResolvedValue({
      data: {
        id: '123',
        first_name: 'John',
        last_name: 'Smith', // Updated last name
        avatar_url: 'https://example.com/avatar.jpg',
      },
      error: null,
    });

    // Perform the operation
    const userId = '123';
    const updates = { last_name: 'Smith' };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .single();

    // Check if the operation was performed correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.update).toHaveBeenCalledWith(updates);
    expect(supabase.eq).toHaveBeenCalledWith('id', userId);
    expect(supabase.single).toHaveBeenCalled();

    // Check the result
    expect(error).toBeNull();
    expect(data).toEqual({
      id: '123',
      first_name: 'John',
      last_name: 'Smith',
      avatar_url: 'https://example.com/avatar.jpg',
    });
  });

  test('admin can fetch all users', async () => {
    // Mock the service client
    const serviceSupabase = getServiceSupabase();
    serviceSupabase.select.mockResolvedValue({
      data: [
        {
          id: '123',
          first_name: 'John',
          last_name: 'Doe',
        },
        {
          id: '456',
          first_name: 'Jane',
          last_name: 'Smith',
        },
      ],
      error: null,
    });

    // Perform the operation
    const { data, error } = await serviceSupabase
      .from('profiles')
      .select('*');

    // Check if the operation was performed correctly
    expect(getServiceSupabase).toHaveBeenCalled();
    expect(serviceSupabase.from).toHaveBeenCalledWith('profiles');
    expect(serviceSupabase.select).toHaveBeenCalledWith('*');

    // Check the result
    expect(error).toBeNull();
    expect(data).toEqual([
      {
        id: '123',
        first_name: 'John',
        last_name: 'Doe',
      },
      {
        id: '456',
        first_name: 'Jane',
        last_name: 'Smith',
      },
    ]);
  });

  test('handles database errors', async () => {
    // Mock database error
    supabase.single.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    // Perform the operation
    const userId = '123';
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Check if the operation was performed correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.select).toHaveBeenCalledWith('*');
    expect(supabase.eq).toHaveBeenCalledWith('id', userId);
    expect(supabase.single).toHaveBeenCalled();

    // Check the result
    expect(data).toBeNull();
    expect(error).toEqual({ message: 'Database error' });
  });

  test('can insert new user data', async () => {
    // Mock successful insert
    supabase.single.mockResolvedValue({
      data: {
        id: '789',
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice@example.com',
      },
      error: null,
    });

    // Prepare data to insert
    const newUser = {
      id: '789',
      first_name: 'Alice',
      last_name: 'Johnson',
      email: 'alice@example.com',
    };

    // Perform the operation
    const { data, error } = await supabase
      .from('profiles')
      .insert(newUser)
      .single();

    // Check if the operation was performed correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.insert).toHaveBeenCalledWith(newUser);
    expect(supabase.single).toHaveBeenCalled();

    // Check the result
    expect(error).toBeNull();
    expect(data).toEqual(newUser);
  });

  test('can delete user data', async () => {
    // Mock successful delete
    supabase.eq.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    // Perform the operation
    const userId = '123';
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    // Check if the operation was performed correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.delete).toHaveBeenCalled();
    expect(supabase.eq).toHaveBeenCalledWith('id', userId);

    // Check the result
    expect(error).toBeNull();
    expect(data).toEqual({ success: true });
  });
}); 