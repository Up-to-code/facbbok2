import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import Post, { PostProps } from "@/components/ui/Post";
import StoriesScreen from "@/components/screens/StoriesF";
import fetchPosts from "@/lib/firebase/getPosts";
import { QueryDocumentSnapshot } from "firebase/firestore";
import { FIREBASE_AUTH } from "@/lib/firebase/firebaseConfig";

const PAGE_LIMIT = 10;

interface FetchPostsResponse {
  posts: PostProps[];
  newLastVisible: QueryDocumentSnapshot<any> | null;
}

const HomeScreen = () => {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<any> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uid = FIREBASE_AUTH.currentUser?.uid as string;

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null); // Reset error state before making a request
    try {
      const { posts: initialPosts, newLastVisible } = (await fetchPosts(
        null,
        false,
        uid
      )) as FetchPostsResponse;
      setPosts(initialPosts);
      setLastVisible(newLastVisible);
    } catch (err) {
      setError("Failed to load posts.");
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const loadMorePosts = useCallback(async () => {
    if (loading || !lastVisible) return;

    setLoading(true);
    setError(null);
    try {
      const { posts: morePosts, newLastVisible } = (await fetchPosts(
        lastVisible,
        false,
        uid
      )) as FetchPostsResponse;
      setPosts((prevPosts) => [...prevPosts, ...morePosts]);
      setLastVisible(newLastVisible);
    } catch (err) {
      setError("Failed to load more posts.");
      console.error("Error loading more posts:", err);
    } finally {
      setLoading(false);
    }
  }, [lastVisible, loading, uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await loadPosts();
    } catch (err) {
      setError("Failed to refresh posts.");
      console.error("Error refreshing posts:", err);
    } finally {
      setRefreshing(false);
    }
  }, [loadPosts]);

  if (loading && posts.length === 0) {
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
      <FlashList
        ListHeaderComponent={<StoriesScreen />}
        data={posts}
        renderItem={({ item }) => <Post {...item}  />}
        keyExtractor={(item) => item.postId}
        estimatedItemSize={300}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#007bff"
              style={styles.loader}
            />
          ) : null
        }
        ListEmptyComponent={
          !loading && posts.length === 0 ? (
            <View style={styles.safeArea}>
              <Text style={styles.errorText}>No posts found.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
    backgroundColor: "#f4f4f4",
  },
  loader: {
    marginVertical: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 16,
  },
});

export default HomeScreen;
