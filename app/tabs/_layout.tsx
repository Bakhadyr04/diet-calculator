import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Калькулятор' }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'История' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Профиль' }}
      />
    </Tabs>
  );
}
