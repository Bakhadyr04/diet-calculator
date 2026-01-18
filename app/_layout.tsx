import { Stack } from 'expo-router';
import UserProvider from '../context/UserContext';

export default function RootLayout() {
  // Инициализация БД больше не требуется - используется API
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="result" />
      </Stack>
    </UserProvider>
  );
}
