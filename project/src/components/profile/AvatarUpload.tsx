import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfileStore } from '@/lib/stores/profile.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  isValidImage, 
  MAX_FILE_SIZE, 
  ALLOWED_IMAGE_TYPES,
  createFilePreview,
  revokeFilePreview,
  formatFileSize
} from '@/lib/utils/file-upload';
import { Upload, User, Trash, X, Camera } from 'lucide-react';
import { getPlatformClasses } from '@/lib/hooks/usePlatformStyles';
import { useUserManagement } from '@/lib/UserManagementProvider';

export function AvatarUpload() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile, uploadAvatar, removeAvatar, isLoading, error } = useProfileStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { platform } = useUserManagement();
  
  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        revokeFilePreview(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (!isValidImage(file)) {
      setUploadError(
        t('profile.errors.invalidImage', {
          types: ALLOWED_IMAGE_TYPES.map(type => type.replace('image/', '.')).join(', '),
          size: formatFileSize(MAX_FILE_SIZE)
        })
      );
      return;
    }
    
    // Clear previous errors
    setUploadError(null);
    
    // Create preview and store file
    const preview = createFilePreview(file);
    setPreviewUrl(preview);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadAvatar(selectedFile);
      
      // Clear file selection
      setSelectedFile(null);
      if (previewUrl) {
        revokeFilePreview(previewUrl);
        setPreviewUrl(null);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadError(t('profile.errors.uploadFailed'));
    }
  };

  const handleRemove = async () => {
    await removeAvatar();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const cancelSelection = () => {
    if (previewUrl) {
      revokeFilePreview(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const containerClasses = getPlatformClasses({
    base: "flex flex-col items-center space-y-4",
    mobile: "px-2"
  });

  const avatarClasses = getPlatformClasses({
    base: "h-32 w-32 border-4 border-background relative",
    mobile: "h-24 w-24"
  });
  
  const iconButtonClasses = getPlatformClasses({
    base: "absolute -bottom-3 -right-3 rounded-full bg-primary text-primary-foreground h-10 w-10 flex items-center justify-center shadow",
    mobile: "h-8 w-8 -bottom-2 -right-2"
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className={containerClasses}>
          {/* Current Avatar or Preview */}
          <div className="relative">
            <Avatar className={avatarClasses}>
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt={t('profile.avatar')} />
              ) : profile?.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt={t('profile.avatar')} />
              ) : (
                <AvatarFallback>
                  <User className="h-16 w-16 text-muted-foreground" />
                </AvatarFallback>
              )}
              
              {/* Edit button overlay */}
              <button
                type="button"
                className={iconButtonClasses}
                onClick={triggerFileInput}
                disabled={isLoading}
              >
                <Camera className="h-5 w-5" />
              </button>
            </Avatar>
          </div>

          {/* Upload controls */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleFileChange}
            className="hidden"
            aria-label={t('profile.uploadAvatar')}
          />

          {/* File selected - show upload/cancel buttons */}
          {selectedFile && (
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? t('common.loading') : t('profile.saveAvatar')}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={cancelSelection}
                disabled={isLoading}
                size="sm"
              >
                <X className="mr-2 h-4 w-4" />
                {t('common.cancel')}
              </Button>
            </div>
          )}

          {/* No file selected but has existing avatar - show remove button */}
          {!selectedFile && profile?.avatarUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={isLoading}
              size="sm"
            >
              <Trash className="mr-2 h-4 w-4" />
              {t('profile.removeAvatar')}
            </Button>
          )}

          {/* No file selected and no existing avatar - show upload button */}
          {!selectedFile && !profile?.avatarUrl && !previewUrl && (
            <Button
              type="button"
              onClick={triggerFileInput}
              disabled={isLoading}
              size="sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('profile.uploadAvatar')}
            </Button>
          )}

          {/* Display errors */}
          {(uploadError || error) && (
            <Alert variant="destructive" className="mt-4">
              {uploadError || error}
            </Alert>
          )}
          
          {/* Help text */}
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t('profile.avatarHelpText', {
              types: ALLOWED_IMAGE_TYPES.map(type => type.replace('image/', '.')).join(', '),
              size: formatFileSize(MAX_FILE_SIZE)
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 