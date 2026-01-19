import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { getOptimizedVideoUrl } from './cloudinary';

export interface GeneratedVideo {
  id: string;
  jobId: string;
  videoUrl: string;
  videoName?: string;
  prompt: string;
  duration: number;
  status: 'done' | 'error';
  error?: string;
  createdAt: Timestamp;
}

// Save a generated video to Firebase
export const saveGeneratedVideo = async (video: Omit<GeneratedVideo, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'generated-videos'), {
      ...video,
      createdAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error: unknown) {
    // Check if it's a permission error
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError?.code === 'permission-denied' || firebaseError?.message?.includes('permission')) {
      console.error('⚠️ Firebase Permission Error: Please update Firestore security rules in Firebase Console');
      console.error('Go to: Firebase Console → Firestore Database → Rules');
      console.error('Add this rule: allow read, write: if true; for generated-videos collection');
      throw new Error('Firebase permission denied. Please update Firestore security rules in Firebase Console.');
    }
    console.error('Error saving generated video:', error);
    throw error;
  }
};

// Get all generated videos from Firebase
export const getGeneratedVideos = async (): Promise<GeneratedVideo[]> => {
  try {
    console.log('[videoService] Fetching videos from Firestore...');
    let querySnapshot;
    
    try {
      // Try with orderBy first (requires index)
      const q = query(collection(db, 'generated-videos'), orderBy('createdAt', 'desc'));
      querySnapshot = await getDocs(q);
    } catch (orderByError) {
      // Fallback: query without orderBy if index doesn't exist
      console.warn('[videoService] orderBy query failed, trying without orderBy:', orderByError);
      querySnapshot = await getDocs(collection(db, 'generated-videos'));
    }
    
    console.log(`[videoService] Found ${querySnapshot.size} documents in Firestore`);
    
    const videos: GeneratedVideo[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`[videoService] Processing document ${doc.id}:`, {
        hasVideoUrl: !!data.videoUrl,
        status: data.status,
        hasPrompt: !!data.prompt,
        hasDuration: !!data.duration,
      });
      
      const video = {
        id: doc.id,
        ...data
      } as GeneratedVideo;
      
      // Apply video compression/optimization if videoUrl exists
      if (video.videoUrl && video.status === 'done') {
        video.videoUrl = getOptimizedVideoUrl(video.videoUrl, {
          quality: 'auto',
          bitRate: 1000, // 1 Mbps
          maxWidth: 1920,
          format: 'auto',
        });
      }
      
      videos.push(video);
    });
    
    // Sort by createdAt if we didn't use orderBy
    if (videos.length > 0 && videos[0].createdAt) {
      videos.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime; // Descending order
      });
    }
    
    console.log(`[videoService] Returning ${videos.length} videos (${videos.filter(v => v.status === 'done').length} done)`);
    return videos;
  } catch (error: unknown) {
    // Check if it's a permission error
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError?.code === 'permission-denied' || firebaseError?.message?.includes('permission')) {
      console.error('⚠️ Firebase Permission Error: Please update Firestore security rules in Firebase Console');
      console.error('Go to: Firebase Console → Firestore Database → Rules');
      console.error('Add this rule: allow read, write: if true; for generated-videos collection');
      throw new Error('Firebase permission denied. Please update Firestore security rules in Firebase Console.');
    }
    console.error('Error getting generated videos:', error);
    throw error;
  }
};

