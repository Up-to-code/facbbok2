import {
  QueryDocumentSnapshot,
  collection,
  query,
  startAfter,
  limit,
  getDocs,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/lib/firebase/firebaseConfig"; // Adjust the import based on your project structure

const PAGE_LIMIT = 10;

export interface PostProps {
  postId: string;
  userId: string;
  content: string;
  imageUrl?: string;
  hasLiked?: boolean;
}

const fetchPosts = async (
  lastVisible: QueryDocumentSnapshot<any> | null,
  withLikes: boolean,
  currentUserId: string
): Promise<{
  posts: PostProps[];
  newLastVisible: QueryDocumentSnapshot<any> | null;
}> => {
  try {
    const postsCollection = collection(FIREBASE_DB, "posts");
    let postsQuery = query(postsCollection, limit(PAGE_LIMIT));

    if (lastVisible) {
      postsQuery = query(postsQuery, startAfter(lastVisible));
    }

    const postsSnapshot = await getDocs(postsQuery);
    const posts = await Promise.all(
      postsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const hasLiked = data.likes?.includes(currentUserId) || false;

        return {
          postId: doc.id,
          userId: data.userId,
          content: data.content,
          imageUrl: data.imageUrl || undefined,
          hasLiked,
        } as PostProps;
      })
    );

    const newLastVisible = postsSnapshot.docs.length
      ? postsSnapshot.docs[postsSnapshot.docs.length - 1]
      : null;

    return { posts, newLastVisible };
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};
export default fetchPosts;