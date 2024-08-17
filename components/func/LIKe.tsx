import React from "react";
import { Button } from "react-native";
import useLikesFilter from "@/hooks/useLikesFilter"; // Import the custom hook

const LikesFilterButton = () => {
  const { withLikes, toggleLikesFilter } = useLikesFilter(); // Use the custom hook

  return (
    <Button
      title={`Show ${withLikes ? "Posts Without Likes" : "Posts With Likes"}`}
      onPress={toggleLikesFilter}
    />
  );
};

export default LikesFilterButton;
