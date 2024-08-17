import { Feather } from "@expo/vector-icons";
import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";

interface UserListProps {
  name: string;
  profileImage: string;
  onSendRequest: () => void;
}

const UserFrind: React.FC<UserListProps> = ({
  name,
  profileImage,
  onSendRequest,
}) => {
  return (
    <View style={styles.container}>
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={styles.image} />
      ) : (
        <View className=" flex justify-center items-center bg-gray-200 w-12 h-12 rounded-full">
       
          <Feather name="user"  className=" text-gray-400"  size={24}/>
        </View>
      )}
      <Text style={styles.name}>{name}</Text>
      <Pressable style={styles.button} onPress={onSendRequest}>
        <Text style={styles.buttonText}>Send Request</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  name: {
    flex: 1,
    fontSize: 18,
    color: "#333",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default UserFrind;
