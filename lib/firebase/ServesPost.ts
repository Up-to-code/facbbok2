import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/lib/firebase/firebaseConfig";

// Fetch the count of likes for a post
export const getLikesCount = async (postId: string): Promise<number> => {
  try {
    const postDocRef = doc(FIREBASE_DB, "posts", postId);
    const postDoc = await getDoc(postDocRef);

    if (postDoc.exists()) {
      const postData = postDoc.data();
      return postData.likesCount || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching likes count: ", error);
    throw error;
  }
};

// Check if a user has liked a post
export const checkIfLiked = async (
  postId: string,
  userId: string
): Promise<boolean> => {
  try {
    const postDocRef = doc(FIREBASE_DB, "posts", postId);
    const postDoc = await getDoc(postDocRef);

    if (postDoc.exists()) {
      const postData = postDoc.data();
      return postData.likes ? postData.likes.includes(userId) : false;
    }
    return false;
  } catch (error) {
    console.error("Error checking if liked: ", error);
    throw error;
  }
};

// Add a like to a post
export const addLike = async (
  postId: string,
  userId: string
): Promise<void> => {
  try {
    const postDocRef = doc(FIREBASE_DB, "posts", postId);
    await updateDoc(postDocRef, {
      likes: arrayUnion(userId),
      likesCount: increment(1), // Increment likesCount by 1
    });
  } catch (error) {
    console.error("Error adding like: ", error);
    throw error;
  }
};

// Remove a like from a post
export const removeLike = async (
  postId: string,
  userId: string
): Promise<void> => {
  try {
    const postDocRef = doc(FIREBASE_DB, "posts", postId);
    await updateDoc(postDocRef, {
      likes: arrayRemove(userId),
      likesCount: increment(-1), // Decrement likesCount by 1
    });
  } catch (error) {
    console.error("Error removing like: ", error);
    throw error;
  }
};
