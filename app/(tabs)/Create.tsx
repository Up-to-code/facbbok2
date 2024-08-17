// app/CreatePostScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet, ActivityIndicator, SafeAreaView, Alert, Text, Pressable, Platform } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FIREBASE_DB, FIREBASE_AUTH, FIREBASE_STORAGE } from '@/lib/firebase/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const CreatePostScreen = () => {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = async () => {
    if (!content) {
      setError('Content is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      let imageUrl = '';

      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const storageRef = ref(FIREBASE_STORAGE, `posts/${Date.now()}`);
        const uploadResult = await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(FIREBASE_DB, 'posts'), {
        content,
        imageUrl,
        userId,
        createdAt: new Date(),
        likesCount: 0,
      });

      setContent('');
      setImageUri(null);
      Alert.alert('Success', 'Post created successfully');
    } catch (err) {
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="What's on your mind?"
          multiline
          numberOfLines={4}
          value={content}
          onChangeText={setContent}
          placeholderTextColor="#999"
        />
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} />
        )}
        <Pressable style={styles.imagePicker} onPress={pickImage}>
          <MaterialIcons name="add-photo-alternate" size={24} color="#007bff" />
          <Text style={styles.imagePickerText}>Pick an image</Text>
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : (
        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Create Post</Text>
        </Pressable>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  textInput: {
    height: 120,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginVertical: 10,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  imagePickerText: {
    marginLeft: 8,
    color: '#007bff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
});

export default CreatePostScreen;
