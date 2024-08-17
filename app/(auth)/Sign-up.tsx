import { FIREBASE_AUTH, FIREBASE_DB } from "@/lib/firebase/firebaseConfig";
import { ar } from "@/lib/lang/ar";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  SafeAreaView,
  TextInput,
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

export default function SignUp() {
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const createUserInFirestore = async (userId: string) => {
    try {
      await setDoc(doc(FIREBASE_DB, "users", userId), {
        name,
        age,
        email,
      });
    } catch (error) {
      console.error("Error creating user document: ", error);
    }
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError(ar.errors.passwords_do_not_match || "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      const userId = userCredential.user.uid;
      await createUserInFirestore(userId);
      router.replace("/home");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>إنشاء حساب</Text>
        <TextInput
          style={styles.input}
          placeholder="الاسم"
          autoCapitalize="none"
          onChangeText={setName}
          value={name}
        />
        <TextInput
          style={styles.input}
          placeholder="العمر"
          autoCapitalize="none"
          onChangeText={setAge}
          value={age}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="البريد الإلكتروني"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="كلمة المرور"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="تأكيد كلمة المرور"
          secureTextEntry
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.button} onPress={handleSignUp} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>إنشاء حساب</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Cairo-ExtraBold",
    marginBottom: 20,
    color: "#343a40",
  },
  input: {
    height: 50,
    width: "100%",
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    fontFamily: "Cairo-Bold",
    textAlign: "right",
    fontSize: 16,
  },
  passwordInput: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginVertical: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Cairo-ExtraBold",
  },
});
