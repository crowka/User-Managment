import { getServiceSupabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  // Check authorization
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 49);

    if (error) {
      throw error;
    }

    return res.status(200).json({ users: data });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Error fetching users' });
  }
} 