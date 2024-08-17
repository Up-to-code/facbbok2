// components/Story.tsx
import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";

interface StoryProps {
  storyId: string;
  userId: string;
  userName: string;
  userImage: string;
  storyImage: string;
  onPress: () => void;
}

const Story: React.FC<StoryProps> = ({
  storyId,
  userId,
  userName,
  userImage,
  storyImage,
  onPress,
}) => {
  return (
    <Pressable style={styles.storyContainer} onPress={onPress}>
      <Image source={{ uri: userImage }} style={styles.userImage} />
      <Image source={{ uri: storyImage }} style={styles.storyImage} />
      <Text style={styles.userName}>{userName}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  storyContainer: {
    width: 100,
    height: 150,
    margin: 5,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: "absolute",
    top: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  storyImage: {
    width: "100%",
    height: "100%",
  },
  userName: {
    position: "absolute",
    bottom: 10,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Story;
