import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import {
  getUsers,
  sendFriendRequest,
} from "@/lib/firebase/Friend/friendFunctions";
import { User } from "@/types/types";
import { FIREBASE_AUTH } from "@/lib/firebase/firebaseConfig";
import { QueryDocumentSnapshot } from "firebase/firestore";
import UserFrind from "@/components/ui/UserList";
import { SafeAreaView } from "react-native-safe-area-context";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<User> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const currentUserId = FIREBASE_AUTH.currentUser?.uid as string;

  const fetchUsers = useCallback(async () => {
    if (!hasMore) return;

    setLoading(true);
    try {
      const { users: fetchedUsers, newLastVisible } = await getUsers(
        lastVisible
      );

      if (fetchedUsers.length > 0) {
        setUsers((prevUsers) => [...prevUsers, ...fetchedUsers]);
        setLastVisible(newLastVisible);
      } else {
        setHasMore(false);
      }
    } catch (error: any) {
      setError("Error fetching users. Please try again later.");
      console.error("Error fetching users: ", error.message || error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible, hasMore]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSendRequest = async (receiverId: string) => {
    if (!currentUserId) {
      Alert.alert("Error", "User not logged in. Please log in and try again.");
      return;
    }

    try {
      await sendFriendRequest(currentUserId, receiverId);
      Alert.alert("Success", "Friend request sent!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        "Error sending friend request. Please try again later."
      );
      console.error("Error sending friend request: ", error.message || error);
    }
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      setLoadingMore(true);
      fetchUsers();
    }
  };

  if (loading && users.length === 0) {
    return (
      <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
    );
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Users</Text>
        {users.length === 0 ? (
          <Text style={styles.noDataText}>No users available</Text>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
              <UserFrind
                name={item.name}
                profileImage={item.profileImage}
                onSendRequest={() => handleSendRequest(item.userId)}
              />
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="small"
                  color="#007bff"
                  style={styles.loader}
                />
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fefefe",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  userItem: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  noDataText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 16,
  },
  loader: {
    marginVertical: 20,
  },
});

export default UserList;
