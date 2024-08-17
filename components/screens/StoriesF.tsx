// app/stories.tsx
import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { FlashList } from "@shopify/flash-list";
import Story from "../ui/Stoies";

const stories = [
  {
    storyId: "1",
    userId: "u1",
    userName: "Alice Johnson",
    userImage: "https://randomuser.me/api/portraits/women/1.jpg",
    storyImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    storyId: "2",
    userId: "u2",
    userName: "Bob Smith",
    userImage: "https://randomuser.me/api/portraits/men/2.jpg",
    storyImage: "https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    storyId: "3",
    userId: "u3",
    userName: "Charlie Brown",
    userImage: "https://randomuser.me/api/portraits/men/3.jpg",
    storyImage: "https://images.unsplash.com/photo-1539125530496-3ca408f9c2d9?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    storyId: "4",
    userId: "u4",
    userName: "Dana White",
    userImage: "https://randomuser.me/api/portraits/women/4.jpg",
    storyImage: "https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    storyId: "5",
    userId: "u5",
    userName: "Eli Black",
    userImage: "https://randomuser.me/api/portraits/men/5.jpg",
    storyImage: "https://images.unsplash.com/photo-1531628689697-cbe78578fd6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wyMDU1NDF8MHwxfGFsbHwxfHx8fHx8fHwxNjc1NzE1MDE5&ixlib=rb-1.2.1&q=80&w=100",
  },
];


const StoriesScreen = () => {
  const handleStoryPress = (storyId: string) => {
    // Handle the story press, e.g., navigate to a detailed view
    console.log(`Story ${storyId} pressed`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlashList
        data={stories}
        renderItem={({ item }) => (
          <Story
            storyId={item.storyId}
            userId={item.userId}
            userName={item.userName}
            userImage={item.userImage}
            storyImage={item.storyImage}
            onPress={() => handleStoryPress(item.storyId)}
          />
        )}
        keyExtractor={(item) => item.storyId}
        horizontal
        showsHorizontalScrollIndicator={false}
        estimatedItemSize={150}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default StoriesScreen;
