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
  } catch (error: any) {
    // Check if it's a permission error
    if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
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
    const q = query(collection(db, 'generated-videos'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const videos: GeneratedVideo[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
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
    
    return videos;
  } catch (error: any) {
    // Check if it's a permission error
    if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
      console.error('⚠️ Firebase Permission Error: Please update Firestore security rules in Firebase Console');
      console.error('Go to: Firebase Console → Firestore Database → Rules');
      console.error('Add this rule: allow read, write: if true; for generated-videos collection');
      throw new Error('Firebase permission denied. Please update Firestore security rules in Firebase Console.');
    }
    console.error('Error getting generated videos:', error);
    throw error;
  }
};

