/**
 * Utility functions for file uploads, primarily focused on image handling
 */

// Allowed image MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Maximum file size in bytes (2MB)
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

/**
 * Validates if a file is an acceptable image
 */
export const isValidImage = (file: File): boolean => {
  return (
    ALLOWED_IMAGE_TYPES.includes(file.type) && 
    file.size <= MAX_FILE_SIZE
  );
};

/**
 * Converts a file to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Creates a URL for a file (for preview purposes)
 */
export const createFilePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revokes a file preview URL to free up memory
 */
export const revokeFilePreview = (previewUrl: string): void => {
  URL.revokeObjectURL(previewUrl);
};

/**
 * Formats file size to a human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}; 