// File: __tests__/__mocks__/supabase.js

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null
    }),
    signIn: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({
      error: null
    }),
    onAuthStateChange: jest.fn().mockImplementation((callback) => {
      // Allow tests to trigger auth state changes
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    })
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({
    data: null,
    error: null
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'avatar.jpg' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/avatar.jpg' } }),
      download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: jest.fn().mockResolvedValue({ data: { path: 'avatar.jpg' }, error: null })
    })
  }
};

export const supabase = mockSupabaseClient;
export const getServiceSupabase = jest.fn().mockReturnValue(mockSupabaseClient);
