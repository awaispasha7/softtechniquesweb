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

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  tags: string[];
  readTime: string;
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
  } catch (error) {
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
  } catch (error) {
    console.error('Error getting blog posts:', error);
    throw error;
  }
};

// Delete a blog post from Firebase
export const deleteBlogPost = async (postId: string) => {
  try {
    await deleteDoc(doc(db, 'softtechniquesBlogPosts', postId));
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

// Update a blog post in Firebase
export const updateBlogPost = async (postId: string, updates: Partial<BlogPost>) => {
  try {
    await updateDoc(doc(db, 'softtechniquesBlogPosts', postId), updates);
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};
