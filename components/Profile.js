import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Profile({ user }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      setError('Failed to fetch profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(updates) {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      await fetchProfile();
    } catch (error) {
      setError('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar(event) {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
    } catch (error) {
      setError('Error uploading avatar');
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="profile">
      <h2>Profile</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="avatar">
        <img src={profile.avatar_url || 'https://example.com/avatar.jpg'} alt="Avatar" />
        <div className="avatar-upload">
          <label htmlFor="avatar-upload">
            Upload Avatar
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
            />
          </label>
        </div>
      </div>
      <form onSubmit={(e) => {
        e.preventDefault();
        updateProfile({
          full_name: profile.full_name,
          website: profile.website,
          avatar_url: profile.avatar_url
        });
      }}>
        <div>
          <label>
            Full Name:
            <input
              type="text"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </label>
        </div>
        <div>
          <label>
            Website:
            <input
              type="url"
              value={profile.website || ''}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            />
          </label>
        </div>
        <div>
          <label>
            Avatar URL:
            <input
              type="url"
              value={profile.avatar_url || ''}
              onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
            />
          </label>
        </div>
        <div className="button-container">
          <button type="submit" disabled={loading}>
            Update Profile
          </button>
        </div>
      </form>
      <style jsx>{`
        .profile {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }
        .avatar {
          margin: 20px 0;
          text-align: center;
        }
        .avatar img {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
        }
        .avatar-upload {
          margin-top: 10px;
        }
        .avatar-upload input[type="file"] {
          display: none;
        }
        .avatar-upload label {
          cursor: pointer;
          padding: 8px 16px;
          background-color: #3b82f6;
          color: white;
          border-radius: 4px;
          display: inline-block;
        }
        label {
          display: block;
          margin: 10px 0;
        }
        input {
          width: 100%;
          padding: 8px;
          margin-top: 5px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .button-container {
          margin-top: 20px;
          text-align: center;
        }
        button {
          padding: 8px 16px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
        .error-message {
          margin: 10px 0;
          padding: 10px;
          background-color: #fee2e2;
          color: #b91c1c;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
} 