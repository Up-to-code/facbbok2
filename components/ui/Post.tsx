import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "@/lib/firebase/firebaseConfig";
import {
  addLike,
  removeLike,
  getLikesCount,
  checkIfLiked,
} from "@/lib/firebase/ServesPost"; // Import the service methods

export interface PostProps {
  postId: string;
  userId: string;
  content: string;
  imageUrl?: string;
}

interface AuthorData {
  name: string;
  profileImage: string;
}

const Post: React.FC<PostProps> = ({ postId, userId, content, imageUrl }) => {
  const router = useRouter();
  const [likes, setLikes] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [authorData, setAuthorData] = useState<AuthorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const authorDocRef = doc(FIREBASE_DB, "users", userId);
        const authorDoc = await getDoc(authorDocRef);

        if (authorDoc.exists()) {
          setAuthorData(authorDoc.data() as AuthorData);
        } else {
          setError("Author not found.");
        }
      } catch (error) {
        console.error("Error fetching author data: ", error);
        setError("Failed to fetch author data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchLikesData = async () => {
      try {
        const count = await getLikesCount(postId);
        setLikes(count);
        const liked = await checkIfLiked(postId, userId);
        setHasLiked(liked);
      } catch (error) {
        console.error("Error fetching likes data: ", error);
        setError("Failed to fetch likes data.");
      }
    };

    fetchAuthorData();
    fetchLikesData();
  }, [userId, postId]);

  const handleLike = async () => {
    try {
      if (hasLiked) {
        await removeLike(postId, userId);
        setLikes((prevLikes) => prevLikes - 1);
      } else {
        await addLike(postId, userId);
        setLikes((prevLikes) => prevLikes + 1);
      }
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error("Error handling like: ", error);
    }
  };

  const navigateToAuthorScreen = () => {
    if (!userId) return;

    router.push(`/author/${userId}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.postContainer}>
          <Pressable
            style={styles.authorContainer}
            onPress={navigateToAuthorScreen}
          >
            {authorData?.profileImage ? (
              <Image
                source={{ uri: authorData.profileImage }}
                style={styles.authorImage}
              />
            ) : (
              <View style={styles.placeholderImage} />
            )}
            <Text style={styles.authorName}>{authorData?.name}</Text>
          </Pressable>
          <Text style={styles.content}>{content}</Text>
          {imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles.postImage} />
          )}
          <View style={styles.actionsContainer}>
            <Pressable style={styles.actionButton} onPress={handleLike}>
              <FontAwesome
                name={hasLiked ? "heart" : "heart-o"}
                size={24}
                color="#f34f4f"
              />
              <Text style={styles.likesCount}>{likes} Likes</Text>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <FontAwesome name="comment-o" size={24} color="#666" />
              <Text style={styles.likesCount}>10 Comments</Text>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Feather name="share-2" size={24} color="#666" />
              <Text style={styles.likesCount}>10 Shares</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    fontSize: 14,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  likesCount: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default Post;
