import { FIREBASE_DB } from "@/lib/firebase/firebaseConfig";
import { User } from "@/types/types";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
interface Props {
  userid: string;
}
const GetuSerImage = ({ userid }: Props) => {
  const [userData, setUserData] = useState<User | DocumentData>();
  useEffect(() => {
    async function fetchData() {
      const col = doc(FIREBASE_DB, "users", userid);
      const docSnap = await getDoc(col);
      if (docSnap.exists()) {
        setUserData(docSnap.data() as any);
      }
    }
    fetchData();
  }, []);
  return (
    <View>
      <Image
        source={{ uri: userData?.profileImage as string }}
        style={{
          width: 50,
          height: 50,
          borderRadius: 50,
        }}
      />
    </View>
  );
};



export default GetuSerImage;
