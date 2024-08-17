import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TextInput,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'; // Import Expo Icons
import {
  getUserData,
  uploadImage,
  updateUserProfile,
} from "@/lib/firebase/Serves";
import { FIREBASE_AUTH } from "@/lib/firebase/firebaseConfig";
import useAuthStore from "@/lib/store/authStore";

interface User {
  name: string;
  bio: string;
  profileImage: string;
}

const UserProfileScreen: React.FC = () => {
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [initialUserData, setInitialUserData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData(userId as string);
        setUser(data);
        setInitialUserData(data as User);
        setName(data.name || "");
        setBio(data.bio || "");
        setProfileImage(data.profileImage || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSave = async () => {
    setUploading(true);
    try {
      await updateUserProfile(userId as string, { name, bio, profileImage });
      alert("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setUploading(true);
        const uploadedImageUrl = await uploadImage(
          uri as string,
          userId as string
        );
        setProfileImage(uploadedImageUrl);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (initialUserData) {
      setName(initialUserData.name || "");
      setBio(initialUserData.bio || "");
      setProfileImage(initialUserData.profileImage || "");
    }
    setEditing(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1DB954" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileContainer}>
          <View style={styles.imageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons name="account-circle" size={120} color="#ddd" />
              </View>
            )}
            {editing && (
              <Pressable
                onPress={handleImageUpload}
                style={styles.editImageButton}
              >
                <FontAwesome name="camera" size={24} color="#fff" />
              </Pressable>
            )}
          </View>

          {editing ? (
            <>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor="#aaa"
              />
              <TextInput
                style={styles.input}
                value={bio}
                onChangeText={setBio}
                placeholder="Bio"
                multiline
                placeholderTextColor="#aaa"
              />
              <View style={styles.buttonRow}>
                <Pressable onPress={handleCancel} style={styles.cancelButton}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSave} style={styles.saveButton}>
                  <Text style={styles.buttonText}>
                    {uploading ? "Saving..." : "Save"}
                  </Text>
                </Pressable>


                <Pressable
                  onPress={() => FIREBASE_AUTH.signOut()}
                  style={styles.logoutButton}
                >
                  <Text style={styles.buttonText}>Logout</Text>
                </Pressable>  
              </View>
            </>
          ) : (
            <>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.bio}>{user?.bio}</Text>
              <Pressable
                onPress={() => setEditing(true)}
                style={styles.editButton}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
                <MaterialIcons name="edit" size={20} color="#fff" style={styles.icon} />
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
  width: "100%",
    alignItems: "center",
   
  },
  
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginVertical: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#1DB954",
    
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: "#1DB954",
    padding: 8,
    borderRadius: 30,
    elevation: 5,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  bio: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginVertical: 16,
  },
  editButton: {
    backgroundColor: "#1DB954",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#1DB954",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  icon: {
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
});

export default UserProfileScreen;
