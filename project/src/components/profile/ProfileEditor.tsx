import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css'; // Add this CSS import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProfileStore } from '@/lib/stores/profile.store'; // Import the profile store

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

type ProfileData = z.infer<typeof profileSchema>;

export function ProfileEditor() {
  const { profile, updateProfile, uploadAvatar, isLoading, error } = useProfileStore(); // Use the profile store
  const [avatar, setAvatar] = useState<string | null>(profile?.avatarUrl || null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const cropperRef = useRef<Cropper>(null); // Fix the type

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempAvatar(reader.result as string);
        setIsAvatarDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      setAvatar(croppedCanvas.toDataURL());
      setIsAvatarDialogOpen(false);
    }
  };

  const onSubmit = async (data: ProfileData) => {
    try {
      await updateProfile(data);
      
      if (avatar && avatar !== profile?.avatarUrl) {
        await uploadAvatar(avatar);
      }
    } catch (submitError) {
      console.error('Error updating profile:', submitError);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <img src={avatar || '/default-avatar.png'} alt="Profile" />
        </Avatar>
        
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            id="avatar-upload"
          />
          <Label htmlFor="avatar-upload">
            <Button variant="outline" className="cursor-pointer">
              Change Avatar
            </Button>
          </Label>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <Alert variant="destructive">{errors.name.message}</Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && (
            <Alert variant="destructive">{errors.email.message}</Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Input id="bio" {...register('bio')} />
          {errors.bio && (
            <Alert variant="destructive">{errors.bio.message}</Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register('location')} />
          {errors.location && (
            <Alert variant="destructive">{errors.location.message}</Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" {...register('website')} />
          {errors.website && (
            <Alert variant="destructive">{errors.website.message}</Alert>
          )}
        </div>

        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>

      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crop Avatar</DialogTitle>
          </DialogHeader>
          {tempAvatar && (
            <>
              <Cropper
                ref={cropperRef}
                src={tempAvatar}
                style={{ height: 400, width: '100%' }}
                aspectRatio={1}
                guides={false}
              />
              <Button onClick={handleCropComplete}>
                Save
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
