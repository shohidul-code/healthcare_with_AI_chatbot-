// File handling utilities for prescription uploads

/**
 * Convert a File object to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix to get just the base64 content
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

/**
 * Convert base64 string back to a downloadable blob
 */
export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Create a download link for a file and trigger download
 */
export const downloadFileFromBase64 = (
  base64Content: string, 
  fileName: string, 
  mimeType: string
): void => {
  const blob = base64ToBlob(base64Content, mimeType);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};

/**
 * Get file size in a human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate file type and size
 */
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword' // .doc
  ];
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds the 10MB limit`
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type '${file.type}' is not supported. Please upload PDF, JPG, PNG, or DOCX files only.`
    };
  }
  
  return { isValid: true };
};

/**
 * Generate a unique document ID
 */
export const generateDocumentId = (): string => {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Compress image files before converting to base64 (for JPG/PNG)
 */
export const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Get MIME type from file extension (fallback)
 */
export const getMimeTypeFromExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword'
  };
  return mimeTypes[extension || ''] || 'application/octet-stream';
};

/**
 * Validate and prepare file for upload
 */
export const prepareFileForUpload = async (file: File): Promise<{ success: boolean; file?: File; error?: string }> => {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Compress images if needed
    const processedFile = await compressImage(file);
    
    return { success: true, file: processedFile };
  } catch (error) {
    return { success: false, error: 'Failed to process file' };
  }
};
