import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_STORAGE } from "@/lib/firebase/firebaseConfig"; // Adjust the import as needed
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const getUserData = async (userId: string) => {
  const userDoc = doc(FIREBASE_DB, "users", userId);
  const userSnapshot = await getDoc(userDoc);
  if (userSnapshot.exists()) {
    return userSnapshot.data();
  } else {
    throw new Error("User not found");
  }
};
// lib/firebase/profile.ts

export const uploadImage = async (imageUri: string, userId: string) => {
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const imageRef = ref(FIREBASE_STORAGE, `profileImages/${userId}`);
  await uploadBytes(imageRef, blob);
  const downloadURL = await getDownloadURL(imageRef);
  return downloadURL;
};

export const updateUserProfile = async (userId: string, userData: any) => {
  const userRef = doc(FIREBASE_DB, "users", userId);
  await updateDoc(userRef, userData);
};

export const likePost = async (postId : string) => {
  try {
    const postRef = doc(FIREBASE_DB, "posts", postId);
    await updateDoc(postRef, {
      likes: increment(1),
    });
    console.log("Post liked successfully!");
  } catch (e) {
    console.error("Error liking post: ", e);
    throw e;
  }
};