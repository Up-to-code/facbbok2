// types.ts
export interface User {
    userId: string;
    name: string;
    email: string;
    friends: string[];
    profileImage: string;
  }
  
  export interface FriendRequest {
    senderId: string;
    receiverId: string;
    status: "pending" | "accepted" | "rejected";
  }
  export interface Notification {
    id: string;
    senderId: string;
    receiverId: string;
    status: string;
    timestamp: Date; // or Timestamp if using Firestore Timestamp
    badge?: number; // Example optional fields
    body?: string;
    data?: Record<string, any>;
    dir?: string;
    // Add any additional fields as necessary
  }
  