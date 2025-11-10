import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from './cloudinary';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  tags: string[];
  readTime: string;
  images?: string[]; // Array of image URLs
  createdAt: Timestamp;
}

// Save a new blog post to Firebase
export const saveBlogPost = async (post: Omit<BlogPost, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'softtechniquesBlogPosts'), {
      ...post,
      createdAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error: unknown) {
    // Check if it's a permission error
    const err = error && typeof error === 'object' ? error as { code?: string; message?: string } : null;
    if (err && (err.code === 'permission-denied' || err.message?.includes('permission'))) {
      console.error('⚠️ Firebase Permission Error: Please update Firestore security rules in Firebase Console');
      console.error('Go to: Firebase Console → Firestore Database → Rules');
      console.error('Add this rule: allow read, write: if true; for softtechniquesBlogPosts collection');
      throw new Error('Firebase permission denied. Please update Firestore security rules in Firebase Console.');
    }
    console.error('Error saving blog post:', error);
    throw error;
  }
};

// Get all blog posts from Firebase
export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const q = query(collection(db, 'softtechniquesBlogPosts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const posts: BlogPost[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      } as BlogPost);
    });
    
    return posts;
  } catch (error: unknown) {
    // Check if it's a permission error
    const err = error && typeof error === 'object' ? error as { code?: string; message?: string } : null;
    if (err && (err.code === 'permission-denied' || err.message?.includes('permission'))) {
      console.error('⚠️ Firebase Permission Error: Please update Firestore security rules in Firebase Console');
      console.error('Go to: Firebase Console → Firestore Database → Rules');
      console.error('Add this rule: allow read, write: if true; for softtechniquesBlogPosts collection');
      throw new Error('Firebase permission denied. Please update Firestore security rules in Firebase Console.');
    }
    console.error('Error getting blog posts:', error);
    throw error;
  }
};

// Delete a blog post from Firebase
export const deleteBlogPost = async (postId: string) => {
  try {
    await deleteDoc(doc(db, 'softtechniquesBlogPosts', postId));
  } catch (error: unknown) {
    // Check if it's a permission error
    const err = error && typeof error === 'object' ? error as { code?: string; message?: string } : null;
    if (err && (err.code === 'permission-denied' || err.message?.includes('permission'))) {
      console.error('⚠️ Firebase Permission Error: Please update Firestore security rules in Firebase Console');
      console.error('Go to: Firebase Console → Firestore Database → Rules');
      console.error('Add this rule: allow read, write: if true; for softtechniquesBlogPosts collection');
      throw new Error('Firebase permission denied. Please update Firestore security rules in Firebase Console.');
    }
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

// Update a blog post in Firebase
export const updateBlogPost = async (postId: string, updates: Partial<BlogPost>) => {
  try {
    await updateDoc(doc(db, 'softtechniquesBlogPosts', postId), updates);
  } catch (error: unknown) {
    // Check if it's a permission error
    const err = error && typeof error === 'object' ? error as { code?: string; message?: string } : null;
    if (err && (err.code === 'permission-denied' || err.message?.includes('permission'))) {
      console.error('⚠️ Firebase Permission Error: Please update Firestore security rules in Firebase Console');
      console.error('Go to: Firebase Console → Firestore Database → Rules');
      console.error('Add this rule: allow read, write: if true; for softtechniquesBlogPosts collection');
      throw new Error('Firebase permission denied. Please update Firestore security rules in Firebase Console.');
    }
    console.error('Error updating blog post:', error);
    throw error;
  }
};

// Upload image to Cloudinary
export const uploadBlogImage = async (file: File, postId: string): Promise<string> => {
  try {
    const folder = `blog-images/${postId}`;
    const imageUrl = await uploadImageToCloudinary(file, folder);
    return imageUrl;
  } catch (error: unknown) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
};

// Upload multiple images
export const uploadBlogImages = async (files: File[], postId: string): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadBlogImage(file, postId));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteBlogImage = async (imageUrl: string): Promise<void> => {
  try {
    await deleteImageFromCloudinary(imageUrl);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - image deletion failure shouldn't break the app
  }
};
