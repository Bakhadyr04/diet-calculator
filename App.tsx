import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { UserProvider, useUserContext } from './context/UserContext';
import { initDatabase } from './database/database';
import RegistrationScreen from './app/auth/registration';
import CalculatorScreen from './app';
import ResultScreen from './app/result';
import HistoryScreen from './app/tabs/history';
import ProfileScreen from './app/tabs/profile';
import { RootStackParamList, MainTabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Главная навигация с табами (после регистрации)
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Main"
        component={CalculatorScreen}
        options={{
          title: 'Калькулятор',
          tabBarLabel: 'Калькулятор',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'История',
          tabBarLabel: 'История',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профиль',
          tabBarLabel: 'Профиль',
        }}
      />
    </Tab.Navigator>
  );
};

// Навигация приложения
const AppNavigator: React.FC = () => {
  const { user, isLoading } = useUserContext();
  const [dbInitialized, setDbInitialized] = useState<boolean>(false);

  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Error initializing database:', error);
        setDbInitialized(true); // Продолжаем работу даже при ошибке
      }
    };

    initializeApp();
  }, []);

  if (!dbInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{
                headerShown: true,
                title: 'Результат',
                headerStyle: { backgroundColor: '#3498db' },
                headerTintColor: '#fff',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Registration" component={RegistrationScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Главный компонент приложения
const App: React.FC = () => {
  return (
    <UserProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </UserProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default App;
