// friendFunctions.ts
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  getDocs,
  query,
  collection,
  where,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  orderBy,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import {
  FIREBASE_DB as db,
  FIREBASE_AUTH as auth,
} from "@/lib/firebase/firebaseConfig";
import { User, Notification } from "@/types/types";

// Send a friend request
export const sendFriendRequest = async (
  senderId: string,
  receiverId: string
): Promise<void> => {
  const [sortedSender, sortedReceiver] = [senderId, receiverId].sort();

  try {
    // Create the friend request document
    await setDoc(
      doc(db, "friendRequests", `${sortedSender}_${sortedReceiver}`),
      {
        senderId,
        receiverId,
        status: "pending",
        timestamp: Timestamp.now(), // Add timestamp
        badge: 0, // Default badge value
        body: "Friend request sent", // Default body message
        data: {}, // Default data
        dir: "default", // Default directory
      }
    );

    // Update or create a notification for the receiver
    await setDoc(doc(db, "users", receiverId, "notifications", senderId), {
      senderId,
      receiverId,
      status: "pending",
      timestamp: Timestamp.now(), // Add timestamp
      badge: 0, // Default badge value
      body: "You have a new friend request", // Default body message
      data: {}, // Default data
      dir: "default", // Default directory
    });
  } catch (error) {
    console.error("Error sending friend request: ", error);
    throw new Error("Failed to send friend request. Please try again.");
  }
};

// Accept a friend request
export const acceptFriendRequest = async (
  senderId: string,
  receiverId: string
): Promise<void> => {
  const [sortedSender, sortedReceiver] = [senderId, receiverId].sort();

  try {
    // Add each other to friends
    await updateDoc(doc(db, "users", senderId), {
      friends: arrayUnion(receiverId),
    });
    await updateDoc(doc(db, "users", receiverId), {
      friends: arrayUnion(senderId),
    });

    // Remove the friend request document
    await updateDoc(doc(db, "notifications", `${sortedSender}_${sortedReceiver}`), {
      status: "accepted",
      timestamp: Timestamp.now(),
      body: "Friend request accepted",
      dir: "default",
    });
  } catch (error) {
    console.error("Error accepting friend request: ", error);
    throw new Error("Failed to accept friend request. Please try again.");
  }
};

// Reject a friend request

export const rejectFriendRequest = async (
  senderId: string,
  receiverId: string
): Promise<void> => {
  try {
    // Remove the friend request document
    await deleteDoc(doc(db, "friendRequests", `${senderId}_${receiverId}`));
  } catch (error) {
    console.error("Error rejecting friend request: ", error);
    throw new Error("Failed to reject friend request. Please try again.");
  }
};

// Get the list of friends for a user

// Get all users

export const getUsers = async (
  lastVisible: QueryDocumentSnapshot<any> | null,
  limitCount: number = 10
): Promise<{
  users: User[];
  newLastVisible: QueryDocumentSnapshot<any> | null;
}> => {
  try {
    const usersCollection = collection(db, "users");
    let usersQuery = query(usersCollection, limit(limitCount));

    if (lastVisible) {
      usersQuery = query(usersQuery, startAfter(lastVisible));
    }

    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    })) as User[];

    const newLastVisible = usersSnapshot.docs.length
      ? usersSnapshot.docs[usersSnapshot.docs.length - 1]
      : null;

    return { users, newLastVisible };
  } catch (error) {
    console.error("Error fetching users: ", error);
    throw error;
  }
};

// Define the Notification type

export const getNotifications = async (
  userId: string,
  lastVisible: QueryDocumentSnapshot<DocumentData> | null,
  limitCount: number = 10
): Promise<{
  notifications: Notification[];
  newLastVisible: QueryDocumentSnapshot<DocumentData> | null;
}> => {
  try {
    // Reference to the notifications subcollection for a specific user
    const notificationsCollection = collection(
      db,
      "users",
      userId,
      "notifications"
    );

    // Create a query with ordering and limiting
    let notificationsQuery = query(
      notificationsCollection,
      orderBy("timestamp", "desc"), // Order by timestamp, descending
      limit(limitCount)
    );

    // If lastVisible is provided, continue querying from that point
    if (lastVisible) {
      notificationsQuery = query(
        notificationsCollection,
        orderBy("timestamp", "desc"), // Ensure consistent ordering
        startAfter(lastVisible),
        limit(limitCount)
      );
    }

    // Fetch documents from Firestore
    const notificationsSnapshot = await getDocs(notificationsQuery);

    // Map the data to your Notification type
    const notifications = notificationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId || "",
        receiverId: data.receiverId || "",
        status: data.status || "pending",
        timestamp:
          data.timestamp instanceof Timestamp
            ? data.timestamp.toDate()
            : data.timestamp,
        badge: data.badge || 0,
        body: data.body || "No content",
        data: data.data || {},
        dir: data.dir || "default",
      } as Notification;
    });

    // Get the new last visible document
    const newLastVisible = notificationsSnapshot.docs.length
      ? (notificationsSnapshot.docs[
          notificationsSnapshot.docs.length - 1
        ] as QueryDocumentSnapshot<DocumentData>)
      : null;

    return { notifications, newLastVisible };
  } catch (error) {
    console.error("Error fetching notifications: ", error);
    throw new Error("Failed to fetch notifications. Please try again.");
  }
};

export const getFriends = async (userId: string): Promise<string[]> => {
  try {
    // Get the user document
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    const friends = userData?.friends || [];

    // Return the list of friends
    return friends;
  } catch (error) {
    console.error("Error fetching friends: ", error);
    throw new Error("Failed to fetch friends. Please try again.");
  }
};
