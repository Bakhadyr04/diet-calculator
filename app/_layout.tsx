import { Stack } from 'expo-router';
import UserProvider from '../context/UserContext';
import { useEffect } from 'react';
import { initDatabase } from '../database/database';


export default function RootLayout() {

  useEffect(() => {
    initDatabase()
      .then(() => {
        console.log('Database initialized');
      })
      .catch((error) => {
        console.error('Database init error:', error);
      });
  }, []);

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
