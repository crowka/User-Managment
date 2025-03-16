import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert } from '@/components/ui/alert';
import { useProfileStore } from '@/lib/stores/profile.store';
import { profileSchema, type ProfileFormData } from '@/lib/types/profile';

export function ProfileForm() {
  const { profile, isLoading, error, fetchProfile, updateProfile } = useProfileStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        isPublic: profile.isPublic,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile(data);
  };

  if (isLoading && !profile) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register('name')}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          aria-invalid={errors.bio ? 'true' : 'false'}
          aria-describedby={errors.bio ? 'bio-error' : undefined}
        />
        {errors.bio && (
          <p id="bio-error" className="text-sm text-red-500">
            {errors.bio.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...register('location')}
          aria-invalid={errors.location ? 'true' : 'false'}
          aria-describedby={errors.location ? 'location-error' : undefined}
        />
        {errors.location && (
          <p id="location-error" className="text-sm text-red-500">
            {errors.location.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          {...register('website')}
          aria-invalid={errors.website ? 'true' : 'false'}
          aria-describedby={errors.website ? 'website-error' : undefined}
        />
        {errors.website && (
          <p id="website-error" className="text-sm text-red-500">
            {errors.website.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          {...register('isPublic')}
        />
        <Label htmlFor="isPublic">Public Profile</Label>
      </div>

      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
} 