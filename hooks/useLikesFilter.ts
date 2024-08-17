import { useState, useCallback } from "react";

const useLikesFilter = () => {
  const [withLikes, setWithLikes] = useState<boolean>(true);

  const toggleLikesFilter = useCallback(() => {
    setWithLikes((prev) => !prev);
  }, []);

  return {
    withLikes,
    toggleLikesFilter,
  };
};

export default useLikesFilter;
