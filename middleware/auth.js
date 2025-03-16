const { supabase } = require('../lib/supabase');

/**
 * Authentication middleware for API routes
 * @param {Function} handler - The API route handler
 * @param {Object} options - Middleware options
 * @param {boolean} options.requireAdmin - Whether to require admin role
 */
function withAuth(handler, options = {}) {
  return async (req, res) => {
    try {
      // Check for authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
      }

      // Get user from Supabase
      const { data: { user }, error } = await supabase.auth.getUser(authHeader.split(' ')[1]);

      if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }

      // Check admin role if required
      if (options.requireAdmin && (!user.app_metadata?.role || user.app_metadata.role !== 'admin')) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      // Add user to request object
      req.user = user;

      // Call the handler
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Server error during authentication' });
    }
  };
}

module.exports = { withAuth }; 