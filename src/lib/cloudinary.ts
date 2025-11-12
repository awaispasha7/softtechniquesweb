// Cloudinary Configuration (hardcoded)
// Note: Using direct API calls instead of SDK to avoid Node.js modules in browser
const CLOUDINARY_CONFIG = {
  cloud_name: 'drwvwxmod',
  api_key: '953152569761969',
  api_secret: 'VhOLttbzQuTV2LA77m1TlWQy3So',
  upload_preset: 'blog_images',
  secure: true, // Use HTTPS
};

// Helper function to upload image from client side
export const uploadImageToCloudinary = async (file: File, folder: string = 'blog-images'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
  formData.append('folder', folder);
  
  // Note: Transformation parameters cannot be used with unsigned uploads
  // Apply transformations via upload preset settings or when displaying images

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload image');
  }

  const data = await response.json();
  return data.secure_url;
};

// Helper function to get optimized image URL (apply transformations when displaying)
export const getOptimizedImageUrl = (originalUrl: string, width?: number, quality: string = 'auto'): string => {
  // If not a Cloudinary URL, return as-is
  if (!originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }
  
  // Insert transformation into Cloudinary URL
  // Format: /upload/w_1200,q_auto,f_auto/
  const transformation = `w_${width || 1200},q_${quality},f_auto`;
  const optimizedUrl = originalUrl.replace('/upload/', `/upload/${transformation}/`);
  
  return optimizedUrl;
};

// Helper function to delete image (using API directly, no SDK)
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public_id from Cloudinary URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    
    if (uploadIndex !== -1) {
      // Extract public_id (everything after /upload/v{version}/)
      const versionIndex = uploadIndex + 1;
      const publicIdParts = pathParts.slice(versionIndex + 1);
      const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension
      
      // Use API directly instead of SDK
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = await generateSignature(publicId, timestamp);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/destroy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_id: publicId,
            timestamp: timestamp,
            signature: signature,
            api_key: CLOUDINARY_CONFIG.api_key,
          }),
        }
      );

      if (!response.ok) {
        console.error('Failed to delete image from Cloudinary');
      }
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    // Don't throw - image deletion failure shouldn't break the app
  }
};

// Generate signature for API calls (client-side safe)
async function generateSignature(publicId: string, timestamp: number): Promise<string> {
  // For client-side, we'll use a simple hash
  // Note: In production, this should be done server-side for security
  const message = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_CONFIG.api_secret}`;
  
  // Use Web Crypto API for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

// Helper function to upload document (PDF/Word) to Cloudinary
export const uploadDocumentToCloudinary = async (file: File, folder: string = 'blog-documents'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
  formData.append('folder', folder);
  formData.append('resource_type', 'raw'); // Use 'raw' for documents/PDFs
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/raw/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload document');
  }

  const data = await response.json();
  return data.secure_url;
};

