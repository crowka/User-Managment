import { rest } from 'msw';

export const handlers = [
  rest.get('/api/profile', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Software developer',
        location: 'New York',
        website: 'https://example.com',
        avatarUrl: null,
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),
  
  rest.put('/api/profile', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(req.body)
    );
  }),
  
  rest.post('/api/profile/avatar', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ avatarUrl: 'https://example.com/avatar.jpg' })
    );
  }),
  
  rest.delete('/api/profile/avatar', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true })
    );
  }),
];
