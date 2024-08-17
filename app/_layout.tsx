import { FIREBASE_AUTH } from "@/lib/firebase/firebaseConfig";
import { router, SplashScreen, Stack } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { getUserData } from "@/lib/firebase/Serves";
import useAuthStore from "@/lib/store/authStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Cairo-Bold": require("../assets/fonts/Cairo-Bold.ttf"),
    "Cairo-ExtraBold": require("../assets/fonts/Cairo-ExtraBold.ttf"),
    "Cairo-Medium": require("../assets/fonts/Cairo-Medium.ttf"),
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const { user, setUser } = useAuthStore();
  // Effect to handle font loading and splash screen
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Effect to handle authentication state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      FIREBASE_AUTH,
      (user: User | null) => {
        setIsAuthenticated(!!user);
      }
    );

    return () => unsubscribe();
  }, []);

  // Effect to handle navigation only after both fonts and auth state are ready
  useEffect(() => {
    if (fontsLoaded && isAuthenticated !== null) {
      setIsNavigationReady(true);
    }
  }, [fontsLoaded, isAuthenticated]);

  // Effect to perform navigation
  useEffect(() => {
    if (isNavigationReady) {
      if (isAuthenticated) {
        async function performNavigation() {
          try {
            const data = await getUserData(
              FIREBASE_AUTH.currentUser?.uid as string
            );
            setUser(data as User);
          } catch (error) {
            console.error(error);
          }

          router.replace("/home");
        }
        performNavigation();
      } else {
        router.replace("/Sign-in");
      }
    }
  }, [isNavigationReady, isAuthenticated]);

  if (!fontsLoaded || !isNavigationReady) {
    return null; // Or you can show a loading spinner here
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
