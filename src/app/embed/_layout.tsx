import { Stack } from 'expo-router';

export default function EmbedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="heatmap" />
      <Stack.Screen name="reports" />
    </Stack>
  );
}
