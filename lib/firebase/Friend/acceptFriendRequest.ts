// friendFunctions.ts
import { updateDoc, deleteDoc, doc, arrayUnion } from "firebase/firestore";
import { FIREBASE_DB as db } from "@/lib/firebase/firebaseConfig";

export const acceptFriendRequest = async (
  senderId: string,
  receiverId: string
): Promise<void> => {
  try {
    // Add each other to friends
    await updateDoc(doc(db, "users", senderId), {
      friends: arrayUnion(receiverId),
    });
    await updateDoc(doc(db, "users", receiverId), {
      friends: arrayUnion(senderId),
    });

    // Remove friend request
    await deleteDoc(doc(db, "friendRequests", `${senderId}_${receiverId}`));
  } catch (error) {
    console.error("Error accepting friend request: ", error);
    throw error;
  }
};
