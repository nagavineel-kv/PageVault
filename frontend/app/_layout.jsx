import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { checkAuth, user, token } = useAuthStore();
  useEffect(() => {
    checkAuth();
  });
  //Handle navigation based on auth state
  useEffect(()=> {
    const isAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;
    if(!isSignedIn && !isAuthScreen) router.replace("/(auth)");
    else if(isSignedIn && isAuthScreen) router.replace("/(tabs)");
  }, [user, token, segments]);
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />ß
        </Stack>
      </SafeScreen>
      <StatusBar style="dark"/>
    </SafeAreaProvider>
  );
}
