import { Stack } from "expo-router";

export default function Layout() {
  return (
      <Stack>
        {/* Screens */}  
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="ChoiceScreen" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
        <Stack.Screen name="A/ad/i" options={{ headerShown: false }} />
        <Stack.Screen name="A/al" options={{ headerShown: false }} />
      </Stack>
  );
}