// friendFunctions.ts
import { doc, setDoc } from "firebase/firestore";
import { FIREBASE_DB as db } from "@/lib/firebase/firebaseConfig";

export const sendFriendRequest = async (
  senderId: string,
  receiverId: string
): Promise<void> => {
  try {
    await setDoc(doc(db, "friendRequests", `${senderId}_${receiverId}`), {
      senderId,
      receiverId,
      status: "pending",
    });
  } catch (error) {
    console.error("Error sending friend request: ", error);
    throw error;
  }
};
