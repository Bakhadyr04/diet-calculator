// API-based database layer
// Все операции теперь выполняются через FastAPI бэкенд
import { api } from '../api/client';
import { User, Calculation, UserStatistics } from '../types';

/* =========================
   ИНИЦИАЛИЗАЦИЯ БАЗЫ
========================= */
export const initDatabase = async (): Promise<void> => {
  // Инициализация больше не требуется, так как используется API
  // Но оставляем функцию для обратной совместимости
  console.log('Using API backend - no local database initialization needed');
};

/* =========================
   USERS
========================= */
export const insertUser = async (
  fullName: string,
  birthDate: string,
  phone: string,
  email: string
): Promise<number> => {
  const { user } = await api.register({
    full_name: fullName,
    birth_date: birthDate,
    phone: phone,
    email: email,
  });
  return user.id;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    // Пытаемся войти без пароля (для обратной совместимости)
    const { user } = await api.login(email);
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const user = await api.getCurrentUser();
    return user;
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
};

/* =========================
   CALCULATIONS
========================= */
export const insertCalculation = async (
  userId: number,
  score: number,
  interpretation: string,
  calculationData: any
): Promise<number> => {
  // Теперь расчет выполняется на бэкенде
  // Эта функция оставлена для обратной совместимости
  // Но фактически расчет должен выполняться через api.createCalculation
  throw new Error('Use api.createCalculation instead');
};

export const getCalculationsByUserId = async (
  userId: number
): Promise<Calculation[]> => {
  try {
    return await api.getCalculations();
  } catch (error) {
    console.error('Error getting calculations:', error);
    return [];
  }
};

/* =========================
   STATISTICS
========================= */
export const getUserStatistics = async (
  userId: number
): Promise<UserStatistics> => {
  try {
    return await api.getUserStatistics();
  } catch (error) {
    console.error('Error getting statistics:', error);
    return {
      total_calculations: 0,
      first_calculation: null,
      last_calculation: null,
      average_score: null,
    };
  }
};
