import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import {
  acceptFriendRequest,
  getNotifications,
  rejectFriendRequest,
} from "@/lib/firebase/Friend/friendFunctions"; // Ensure correct path
import { Notification } from "@/types/types";
import { FIREBASE_AUTH } from "@/lib/firebase/firebaseConfig";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import GetuSerImage from "@/components/ui/GetuSerImage";

const NotificationScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const currentUserId = FIREBASE_AUTH.currentUser?.uid as string;

  const fetchNotifications = useCallback(async () => {
    if (!hasMore) return;

    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const { notifications: fetchedNotifications, newLastVisible } =
        await getNotifications(currentUserId, lastVisible);

      if (fetchedNotifications.length > 0) {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          ...fetchedNotifications,
        ]);
        setLastVisible(newLastVisible);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Detailed Error Info:", error);
      setError("Error fetching notifications. Please try again later.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible, hasMore, currentUserId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      setLoadingMore(true);
      fetchNotifications();
    }
  };

  const handleAction = async (item: Notification) => {
    try {
      if (item.status === "pending") {
        await acceptFriendRequest(currentUserId, item.senderId);
        Alert.alert("Success", "Friend request accepted.");
      } else {
        await rejectFriendRequest(currentUserId, item.senderId);
        Alert.alert("Success", "Friend request rejected.");
      }
    } catch (error) {
      console.error("Action Error:", error);
      Alert.alert("Error", "Failed to process request. Please try again.");
    }
  };

  if (loading && notifications.length === 0) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {notifications.length === 0 && !loading && !error && (
        <Text style={styles.emptyText}>No notifications to show</Text>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <View style={styles.notificationHeader}>
              <GetuSerImage userid={item.senderId} />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationText}>{item.body}</Text>
              <Text style={styles.notificationTimestamp}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
            <View style={styles.notificationFooter}>
              <Pressable
                style={[
                  styles.actionButton,
                  {
                    backgroundColor:
                      item.status === "pending" ? "#1b73e5" : "#cacaca",
                  },
                ]}
                onPress={() => handleAction(item)} // Add the correct function here
              >
                <Text style={styles.actionButtonText}>
                  {item.status === "pending" ? "Accept" : "Reject"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f4f4",
  },
  notificationItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationContent: {
    flex: 1,
    marginHorizontal: 8,
  },
  notificationText: {
    fontSize: 16,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  notificationFooter: {
    alignItems: "flex-end",
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});

export default NotificationScreen;
