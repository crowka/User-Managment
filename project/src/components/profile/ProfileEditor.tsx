import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Cropper from 'react-cropper';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert } from '../ui/alert';
import { Avatar } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

type ProfileData = z.infer<typeof profileSchema>;

export function ProfileEditor() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const cropperRef = useRef<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
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
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      setAvatar(croppedCanvas.toDataURL());
      setIsAvatarDialogOpen(false);
    }
  };

  const onSubmit = async (data: ProfileData) => {
    console.log('Profile data:', { ...data, avatar });
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

        <Button type="submit">Save Profile</Button>
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