// Типы для пользователя
export interface User {
  id: number;
  full_name: string;
  birth_date: string;
  phone: string;
  email: string;
  created_at?: string;
}

// Типы для расчетов
export interface Calculation {
  id: number;
  user_id: number;
  score: number;
  interpretation: string;
  calculation_data: string;
  created_at: string;
}

// Типы для ответов калькулятора
export interface CalculatorAnswers {
  vegetables: number;
  fruits: number;
  legumes: number;
  cereals: number;
  fish: number;
  meat: number;
  dairy: number;
  alcohol: number;
  oliveOil: number;
  nuts: number;
}

// Типы для интерпретации
export interface Interpretation {
  level: string;
  description: string;
  recommendations: string[];
}

// Типы для статистики
export interface UserStatistics {
  total_calculations: number;
  first_calculation: string | null;
  last_calculation: string | null;
  average_score: number | null;
}

// Типы для навигации
export type RootStackParamList = {
  Registration: undefined;
  MainTabs: undefined;
  Result: {
    score: number;
    interpretation: Interpretation;
    answers: CalculatorAnswers;
  };
};

export type MainTabParamList = {
  Main: undefined;
  History: undefined;
  Profile: undefined;
};
