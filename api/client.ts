import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User, Calculation, UserStatistics, CalculatorAnswers, Interpretation } from '../types';

// Пример: если ваш IP адрес 192.168.1.100, установите:
const YOUR_COMPUTER_IP = '192.168.0.103'; // ⚠️ ЗАМЕНИТЕ НА ВАШ IP!

// Определение базового URL API
const getApiBaseUrl = (): string => {
  // Приоритет 1: Переменная окружения
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Приоритет 2: Для веб используем localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api';
  }

  // Приоритет 3: Для мобильных устройств используем IP адрес компьютера
  return `http://${YOUR_COMPUTER_IP}:8000/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Выводим URL в консоль для отладки
if (__DEV__) {
  console.log('🌐 API Base URL:', API_BASE_URL);
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Получение токена из хранилища
const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Сохранение токена
const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Удаление токена
const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Базовый fetch с обработкой ошибок
const fetchApi = async (
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<Response> => {
  const token = requireAuth ? await getToken() : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new ApiError(response.status, errorData.detail || 'Request failed');
    }

    return response;
  } catch (error: any) {
    // Улучшенная обработка сетевых ошибок
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error.message === 'Network request failed' || error.message?.includes('Failed to fetch')) {
      throw new ApiError(
        0,
        `Не удалось подключиться к серверу. Убедитесь что бэкенд запущен на ${API_BASE_URL.replace('/api', '')}`
      );
    }
    
    throw error;
  }
};

// API методы
export const api = {
  // Аутентификация
  async register(userData: {
    full_name: string;
    birth_date: string;
    phone: string;
    email: string;
    password?: string;
  }): Promise<{ user: User; access_token: string }> {
    const response = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false); // Регистрация не требует токена
    const user = await response.json();
    
    // После регистрации автоматически входим для получения токена
    try {
      const loginResponse = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: userData.email, password: userData.password }),
      }, false); // Вход не требует токена
      const loginData = await loginResponse.json();
      if (loginData.access_token) {
        await saveToken(loginData.access_token);
      }
      return { user: loginData.user, access_token: loginData.access_token };
    } catch {
      // Если вход не удался, возвращаем пользователя без токена
      // Пользователю нужно будет войти вручную
      return { user, access_token: '' };
    }
  },

  async login(email: string, password?: string): Promise<{ user: User; access_token: string }> {
    const response = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false); // Вход не требует токена
    const data = await response.json();
    if (data.access_token) {
      await saveToken(data.access_token);
    }
    return { user: data.user, access_token: data.access_token };
  },

  async getCurrentUser(): Promise<User> {
    const response = await fetchApi('/auth/me');
    return response.json();
  },

  async logout(): Promise<void> {
    await removeToken();
  },

  // Пользователи
  async getUserStatistics(): Promise<UserStatistics> {
    const response = await fetchApi('/users/me/statistics');
    return response.json();
  },

  // Расчеты
  async createCalculation(answers: CalculatorAnswers): Promise<{
    score: number;
    interpretation: Interpretation;
  }> {
    const response = await fetchApi('/calculations/', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
    return response.json();
  },

  async getCalculations(): Promise<Calculation[]> {
    const response = await fetchApi('/calculations/');
    const data = await response.json();
    // Преобразуем данные из API в формат Calculation
    return data.map((calc: any) => ({
      id: calc.id,
      user_id: calc.user_id,
      score: calc.score,
      interpretation: JSON.stringify(calc.interpretation),
      calculation_data: JSON.stringify(calc.calculation_data),
      created_at: calc.created_at,
    }));
  },

  async getCalculationById(id: number): Promise<Calculation> {
    const response = await fetchApi(`/calculations/${id}`);
    const data = await response.json();
    return {
      id: data.id,
      user_id: data.user_id,
      score: data.score,
      interpretation: JSON.stringify(data.interpretation),
      calculation_data: JSON.stringify(data.calculation_data),
      created_at: data.created_at,
    };
  },
};

// Экспорт для обратной совместимости
export { getToken, saveToken, removeToken };
