// userFunctions.ts
import { collection, getDocs, doc, QueryDocumentSnapshot } from "firebase/firestore";
import { FIREBASE_DB as db } from "@/lib/firebase/firebaseConfig";
import { User } from "@/types/types";

// Function to fetch all users except the current user
export const fetchUsers = async (currentUserId: string): Promise<User[]> => {
  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const users = usersSnapshot.docs
      .filter((doc) => doc.id !== currentUserId) // Exclude current user
      .map((doc) => ({
        userId: doc.id,
        ...doc.data(),
      } as User));
    return users;
  } catch (error) {
    console.error("Error fetching users: ", error);
    throw error;
  }
};
