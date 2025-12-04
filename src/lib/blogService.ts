import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  getDoc,
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
  userId: string; // User who created the post
  userDisplayName?: string; // Display name of the user
}

// Save a new blog post to Firebase (requires userId)
export const saveBlogPost = async (post: Omit<BlogPost, 'id' | 'createdAt' | 'userId'>, userId: string, userDisplayName?: string) => {
  if (!userId) {
    throw new Error('User must be authenticated to create blog posts.');
  }
  
  try {
    const docRef = await addDoc(collection(db, 'softtechniquesBlogPosts'), {
      ...post,
      userId,
      userDisplayName: userDisplayName || post.author,
      createdAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error: unknown) {
    // Check if it's a permission error
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError?.code === 'permission-denied' || firebaseError?.message?.includes('permission')) {
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

// Delete a blog post from Firebase (requires userId to verify ownership, unless user is admin)
export const deleteBlogPost = async (postId: string, userId: string, isAdminUser: boolean = false) => {
  if (!userId) {
    throw new Error('User must be authenticated to delete blog posts.');
  }
  
  try {
    // Verify ownership before deleting (unless user is admin)
    if (!isAdminUser) {
      const postDoc = await getDoc(doc(db, 'softtechniquesBlogPosts', postId));
      if (!postDoc.exists()) {
        throw new Error('Blog post not found.');
      }
      
      const postData = postDoc.data() as BlogPost;
      if (postData.userId !== userId) {
        throw new Error('You can only delete your own blog posts.');
      }
    }
    
    await deleteDoc(doc(db, 'softtechniquesBlogPosts', postId));
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    // Check if it's a permission error
    if (firebaseError?.code === 'permission-denied' || firebaseError?.message?.includes('permission')) {
      console.error('⚠️ Firebase Permission Error: Please update Firestore security rules in Firebase Console');
      console.error('Go to: Firebase Console → Firestore Database → Rules');
      console.error('Add this rule: allow read, write: if true; for softtechniquesBlogPosts collection');
      throw new Error('Firebase permission denied. Please update Firestore security rules in Firebase Console.');
    }
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

// Update a blog post in Firebase (requires userId to verify ownership, unless user is admin)
export const updateBlogPost = async (postId: string, updates: Partial<BlogPost>, userId: string, isAdminUser: boolean = false) => {
  if (!userId) {
    throw new Error('User must be authenticated to update blog posts.');
  }
  
  try {
    // Verify ownership before updating (unless user is admin)
    if (!isAdminUser) {
      const postDoc = await getDoc(doc(db, 'softtechniquesBlogPosts', postId));
      if (!postDoc.exists()) {
        throw new Error('Blog post not found.');
      }
      
      const postData = postDoc.data() as BlogPost;
      if (postData.userId !== userId) {
        throw new Error('You can only update your own blog posts.');
      }
    }
    
    await updateDoc(doc(db, 'softtechniquesBlogPosts', postId), updates);
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    // Check if it's a permission error
    if (firebaseError?.code === 'permission-denied' || firebaseError?.message?.includes('permission')) {
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
