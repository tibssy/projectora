import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { app } from './firebaseConfig';

// Initialize Firestore
const db = getFirestore(app);

// --- Data Types ---
// Define a TypeScript type for our Animation data, including the document ID
export type Animation = {
  id: string;
  title: string;
  theme: string;
  riveUrl: string;
  thumbnailUrl: string;
  likes: number;
  views: number;
  order: number;
  triggers?: number;
};

// --- API Functions ---

/**
 * Fetches all animations from the Firestore collection, ordered by the 'order' field.
 * @returns A promise that resolves to an array of Animation objects.
 */
export const getAnimations = async (): Promise<Animation[]> => {
  try {
    const animationsCollection = collection(db, 'animations');
    // Create a query to order the documents by the 'order' field
    const q = query(animationsCollection, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);

    const animationsList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Animation));

    return animationsList;
  } catch (error) {
    console.error("Error fetching animations:", error);
    return []; // Return an empty array on error as a safe fallback
  }
};

/**
 * Fetches a single animation document by its ID.
 * @param id The unique ID of the animation document.
 * @returns A promise that resolves to a single Animation object, or null if not found.
 */
export const getAnimationById = async (id: string): Promise<Animation | null> => {
  try {
    const docRef = doc(db, 'animations', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Animation;
    } else {
      console.warn(`No animation found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching animation by ID:", error);
    return null;
  }
};
