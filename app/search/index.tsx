// UserList.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { fetchUsers } from "@/lib/firebase/userFunctions";
import { sendFriendRequest } from "@/lib/firebase/Friend/friendFunctions";
import { User } from "@/types/types";
import { FIREBASE_AUTH } from "@/lib/firebase/firebaseConfig";

const UserList: React.FC = () => {
  const currentUserId = FIREBASE_AUTH.currentUser?.uid || "";
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersList = await fetchUsers(currentUserId);
      setUsers(usersList);
    } catch (error) {
      setError("Error fetching users.");
      console.error("Error fetching users: ", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSendRequest = async (receiverId: string) => {
    try {
      await sendFriendRequest(currentUserId, receiverId);
      Alert.alert("Friend request sent!");
    } catch (error) {
      Alert.alert("Error sending friend request.");
      console.error("Error sending friend request: ", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userName}>{item.name}</Text>
            <Button
              title="Add Friend"
              onPress={() => handleSendRequest(item.userId)}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f4f4",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  userName: {
    fontSize: 18,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 16,
  },
});

export default UserList;
