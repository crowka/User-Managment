// __tests__/__mocks__/supabase.js

// Enhanced Supabase mock with comprehensive API coverage
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
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
    }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({
      data: {},
      error: null
    }),
    updateUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null
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
  limit: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  and: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  containedBy: jest.fn().mockReturnThis(),
  overlaps: jest.fn().mockReturnThis(),
  textSearch: jest.fn().mockReturnThis(),
  filter: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({
    data: null,
    error: null
  }),
  maybeSingle: jest.fn().mockResolvedValue({
    data: null,
    error: null
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'avatar.jpg' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/avatar.jpg' } }),
      download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: jest.fn().mockResolvedValue({ data: { path: 'avatar.jpg' }, error: null }),
      list: jest.fn().mockResolvedValue({ data: [], error: null }),
      move: jest.fn().mockResolvedValue({ data: { path: 'new/path.jpg' }, error: null }),
      createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://example.com/signed-url' }, error: null }),
      createSignedUrls: jest.fn().mockResolvedValue({ data: [{ signedUrl: 'https://example.com/signed-url' }], error: null })
    })
  },
  rpc: jest.fn().mockImplementation((procedure, params) => {
    return Promise.resolve({
      data: null,
      error: null
    });
  })
};

export const supabase = mockSupabaseClient;
export const getServiceSupabase = jest.fn().mockReturnValue(mockSupabaseClient);
