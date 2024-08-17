import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useGlobalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "@/lib/firebase/firebaseConfig";

const AuthorScreen = () => {
  const { userId } = useGlobalSearchParams();
  const [authorData, setAuthorData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const authorDocRef = doc(FIREBASE_DB, "users", userId as string);
        const authorDoc = await getDoc(authorDocRef);

        if (authorDoc.exists()) {
          setAuthorData(authorDoc.data());
        } else {
          setError("Author not found.");
        }
      } catch (err) {
        console.error("Error fetching author data: ", err);
        setError("Failed to fetch author data.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAuthorData();
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {authorData ? (
        <>
          <Image
            source={{ uri: authorData.profileImage }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{authorData.name}</Text>
          <Text style={styles.bio}>{authorData.bio}</Text>
          {/* Render additional author details here */}
        </>
      ) : (
        <Text style={styles.text}>No author data available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  text: {
    fontSize: 18,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  bio: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default AuthorScreen;
