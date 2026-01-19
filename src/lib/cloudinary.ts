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

// Helper function to upload and compress video to Cloudinary
export const uploadVideoToCloudinary = async (
  videoUrl: string, 
  folder: string = 'generated-videos',
  options: {
    quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
    bitRate?: number;
    maxWidth?: number;
    maxHeight?: number;
    format?: 'mp4' | 'webm' | 'auto';
  } = {}
): Promise<string> => {
  try {
    // Fetch the video from the URL
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video from URL: ${videoUrl}`);
    }
    
    const videoBlob = await videoResponse.blob();
    const videoFile = new File([videoBlob], 'video.mp4', { type: 'video/mp4' });
    
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
    formData.append('folder', folder);
    formData.append('resource_type', 'video');
    
    // Compression and optimization settings
    const transformations: string[] = [];
    
    // Quality setting (default: 'auto' for best compression)
    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    } else {
      transformations.push('q_auto'); // Auto quality for best compression
    }
    
    // Bit rate for video compression (lower = smaller file)
    if (options.bitRate) {
      transformations.push(`br_${options.bitRate}`);
    } else {
      // Default bit rate for good compression (adjust based on needs)
      transformations.push('br_1m'); // 1 Mbps for good compression
    }
    
    // Max dimensions (optional, helps reduce size)
    if (options.maxWidth) {
      transformations.push(`w_${options.maxWidth}`);
    }
    if (options.maxHeight) {
      transformations.push(`h_${options.maxHeight}`);
    }
    
    // Format (default: auto for best compression)
    if (options.format) {
      transformations.push(`f_${options.format}`);
    } else {
      transformations.push('f_auto'); // Auto format (usually webm for better compression)
    }
    
    // Additional compression settings
    transformations.push('vc_h264'); // H.264 codec for compatibility
    transformations.push('ac_aac'); // AAC audio codec
    
    if (transformations.length > 0) {
      formData.append('eager', transformations.join(','));
    }
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload and compress video');
    }

    const data = await response.json();
    
    // Return the eager transformation URL if available (compressed version)
    // Otherwise return the original secure_url
    if (data.eager && data.eager.length > 0) {
      return data.eager[0].secure_url;
    }
    
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
};

// Helper function to get optimized/compressed video URL from Cloudinary
export const getOptimizedVideoUrl = (
  videoUrl: string,
  options: {
    quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
    bitRate?: number;
    maxWidth?: number;
    maxHeight?: number;
    format?: 'mp4' | 'webm' | 'auto';
  } = {}
): string => {
  // If not a Cloudinary URL, return as-is
  if (!videoUrl.includes('cloudinary.com')) {
    return videoUrl;
  }
  
  // Build transformation string
  const transformations: string[] = [];
  
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  } else {
    transformations.push('q_auto');
  }
  
  if (options.bitRate) {
    transformations.push(`br_${options.bitRate}`);
  } else {
    transformations.push('br_1m'); // Default 1 Mbps
  }
  
  if (options.maxWidth) {
    transformations.push(`w_${options.maxWidth}`);
  }
  if (options.maxHeight) {
    transformations.push(`h_${options.maxHeight}`);
  }
  
  if (options.format) {
    transformations.push(`f_${options.format}`);
  } else {
    transformations.push('f_auto');
  }
  
  transformations.push('vc_h264');
  transformations.push('ac_aac');
  
  const transformation = transformations.join(',');
  
  // Insert transformation into Cloudinary URL
  const optimizedUrl = videoUrl.replace('/upload/', `/upload/${transformation}/`);
  
  return optimizedUrl;
};

