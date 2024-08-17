import React from "react";
import { router, Tabs } from "expo-router";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import { Image, View } from "react-native";
import useAuthStore from "@/lib/store/authStore";

const Layout = () => {
  const { user } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        headerRight: () => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 10,
              gap: 20,
            }}
          >
            <Feather
              name="search"
              size={24}
              color="black"
              onPress={() => router.push("/search")}
            />
            <Feather
              name="user-plus"
              size={24}
              color="black"
              onPress={() => router.push("/Freind")}
            />
            <MaterialIcons
              name="notifications-none"
              size={24}
              color="black"
              onPress={() => router.push("/Notification")}
            />
            <Image
              source={{ uri: user?.profileImage }}
              style={{ width: 35, height: 35, borderRadius: 20 }}
            />
          </View>
        ),
        tabBarActiveTintColor: "#1DB954", // Green color for active icons
        tabBarInactiveTintColor: "#666", // Gray color for inactive icons
        tabBarLabelStyle: {
          fontSize: 0, // Hide labels by setting font size to 0
        },
        tabBarStyle: {
          width: "100%",
          backgroundColor: "#fff", // White background
          borderTopWidth: 0, // No border
          elevation: 5, // Shadow for elevation
          height: 60, // Height of the tab bar
          paddingBottom: 10, // Padding for positioning
          borderTopColor: "#eee", // Subtle top border color for a soft separation
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo
              name="home"
              color={color}
              size={size}
              style={{
                padding: 5,
                backgroundColor:
                  color === "#1DB954" ? "#f0f9f4" : "transparent",
                borderRadius: 20,
                shadowColor: color === "#1DB954" ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="likeat"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo
              name="heart"
              color={color}
              size={size}
              style={{
                padding: 5,
                backgroundColor:
                  color === "#1DB954" ? "#f0f9f4" : "transparent",
                borderRadius: 20,
                shadowColor: color === "#1DB954" ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Create"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo
              name="plus"
              color={color}
              size={size}
              style={{
                padding: 5,
                backgroundColor:
                  color === "#1DB954" ? "#f0f9f4" : "transparent",
                borderRadius: 20,
                shadowColor: color === "#1DB954" ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo
              name="chat"
              color={color}
              size={size}
              style={{
                padding: 5,
                backgroundColor:
                  color === "#1DB954" ? "#f0f9f4" : "transparent",
                borderRadius: 20,
                shadowColor: color === "#1DB954" ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="user/index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={{ uri: user?.profileImage }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default Layout;
