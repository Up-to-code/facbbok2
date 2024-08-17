import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import {
  FIREBASE_AUTH,
  FIREBASE_DB,
  FIREBASE_STORAGE,
} from "@/lib/firebase/firebaseConfig";
import { updateProfile, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ar } from "@/lib/lang/ar";

const EditProfile: React.FC = () => {
  const user = FIREBASE_AUTH.currentUser as User;

  const [name, setName] = useState<string>(user.displayName || "");
  const [photoURL, setPhotoURL] = useState<string>(user.photoURL || "");
  const [phone, setPhone] = useState<string>(""); // New state for phone number
  const [loading, setLoading] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.uid) {
          throw new Error("User ID is undefined");
        }

        const userRef = doc(FIREBASE_DB, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.displayName || "");
          setPhotoURL(userData.photoURL || "");
          setPhone(userData.phone || ""); // Fetch phone number
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
        Alert.alert(
          "Fetch Error",
          "There was an error fetching your profile data."
        );
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      if (!user?.uid) {
        throw new Error("User ID is undefined");
      }

      if (name !== user.displayName) {
        console.log("Updating display name to: ", name);
        await updateProfile(user, { displayName: name });
      }

      if (imageUri) {
        console.log("Image URI selected: ", imageUri);
        if (photoURL) {
          try {
            console.log("Deleting old photo at: ", photoURL);
            const oldPhotoRef = ref(FIREBASE_STORAGE, user.photoURL!);
            await deleteObject(oldPhotoRef);
          } catch (error) {
            console.error("Error deleting old photo: ", error);
          }
        }

        const response = await fetch(imageUri);
        if (!response.ok) throw new Error("Failed to fetch image");
        const blob = await response.blob();
        const photoRef = ref(FIREBASE_STORAGE, `profilePictures/${user.uid}`);

        console.log("Starting upload to: ", photoRef);
        const uploadTask = uploadBytesResumable(photoRef, blob);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
          },
          (error) => {
            console.error("Error uploading new photo: ", error);
            Alert.alert(
              "Upload Error",
              "There was an error uploading your new profile picture."
            );
          },
          async () => {
            try {
              const newPhotoURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("New photo URL: ", newPhotoURL);
              await updateProfile(user, { photoURL: newPhotoURL });
              setPhotoURL(newPhotoURL);

              const userRef = doc(FIREBASE_DB, "users", user.uid);
              await setDoc(
                userRef,
                {
                  displayName: name,
                  photoURL: newPhotoURL,
                  phone, // Include phone number
                },
                { merge: true }
              );

              router.back();
            } catch (error) {
              console.error(
                "Error getting download URL or updating profile: ",
                error
              );
              Alert.alert(
                "Update Error",
                "There was an error updating your profile picture."
              );
            }
          }
        );
      } else {
        console.log("Updating user data without new photo...");
        const userRef = doc(FIREBASE_DB, "users", user.uid);
        await setDoc(
          userRef,
          {
            displayName: name,
            phone, // Include phone number
            ...(photoURL ? { photoURL } : {}),
          },
          { merge: true }
        );

        router.back();
      }
    } catch (error) {
      console.error("Error updating profile: ", error);
      Alert.alert(
        "Update Failed",
        "There was an error updating your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Image Pick Error", "There was an error picking the image.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.profileImage} />
        ) : photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage} />
        )}
      </TouchableOpacity>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        style={styles.input}
      />
      <TextInput
        value={user.email || ""}
        editable={false}
        placeholder="Email"
        style={[styles.input, styles.disabledInput]}
      />
      <TextInput
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone Number"
        style={styles.input}
      />

      <Pressable
        style={styles.button}
        onPress={handleUpdate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{ar.update}</Text>
      </Pressable>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.progressText}>
            {ar.loading}: {uploadProgress.toFixed(2)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#007bff",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ccc",
  },
  input: {
    width: "100%",
    padding: 12,
    marginVertical: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    elevation: 1,
  },
  disabledInput: {
    backgroundColor: "#e0e0e0",
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    top: 0,
    backgroundColor: "#42424263",
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    height: "100%",
    width: Dimensions.get("window").width,
    justifyContent: "center",
  },
  progressText: {
    marginTop: 8,
    color: "#007bff",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    paddingHorizontal: 20,
    textAlign: "center",
    fontFamily: "Cairo-ExtraBold",
    fontSize: 16,
  },
});

export default EditProfile;
