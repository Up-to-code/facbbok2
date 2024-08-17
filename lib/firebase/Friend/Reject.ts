// friendFunctions.ts
import { deleteDoc, doc } from "firebase/firestore";
import { FIREBASE_DB as db } from "@/lib/firebase/firebaseConfig";

export const rejectFriendRequest = async (
  senderId: string,
  receiverId: string
): Promise<void> => {
  try {
    await deleteDoc(doc(db, "friendRequests", `${senderId}_${receiverId}`));
  } catch (error) {
    console.error("Error rejecting friend request: ", error);
    throw error;
  }
};
