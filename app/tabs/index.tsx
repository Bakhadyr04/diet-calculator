import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';

import { api } from '../../api/client';
import { useUserContext } from '../../context/UserContext';
import { CalculatorAnswers } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AnswerFields {
  vegetables: string;
  fruits: string;
  legumes: string;
  cereals: string;
  fish: string;
  meat: string;
  dairy: string;
  alcohol: string;
  oliveOil: string;
  nuts: string;
}

const CalculatorScreen: React.FC = () => {
  const { user } = useUserContext();

  const [answers, setAnswers] = useState<AnswerFields>({
    vegetables: '',
    fruits: '',
    legumes: '',
    cereals: '',
    fish: '',
    meat: '',
    dairy: '',
    alcohol: '',
    oliveOil: '',
    nuts: '',
  });

  const fields = [
    {
      key: 'vegetables' as keyof AnswerFields,
      label: 'Овощи (порций в день)',
      hint: '0-5 порций',
      max: 5,
    },
    {
      key: 'fruits' as keyof AnswerFields,
      label: 'Фрукты (порций в день)',
      hint: '0-5 порций',
      max: 5,
    },
    {
      key: 'legumes' as keyof AnswerFields,
      label: 'Бобовые (порций в неделю)',
      hint: '0-3 порций',
      max: 3,
    },
    {
      key: 'cereals' as keyof AnswerFields,
      label: 'Злаки (порций в день)',
      hint: '0-5 порций',
      max: 5,
    },
    {
      key: 'fish' as keyof AnswerFields,
      label: 'Рыба (порций в неделю)',
      hint: '0-3 порций',
      max: 3,
    },
    {
      key: 'meat' as keyof AnswerFields,
      label: 'Мясо (порций в неделю)',
      hint: '0-2 порций (меньше лучше)',
      max: 2,
    },
    {
      key: 'dairy' as keyof AnswerFields,
      label: 'Молочные продукты (порций в день)',
      hint: '0-2 порций',
      max: 2,
    },
    {
      key: 'alcohol' as keyof AnswerFields,
      label: 'Алкоголь (бокалов в день)',
      hint: '0-2 бокала (умеренное потребление)',
      max: 2,
    },
    {
      key: 'oliveOil' as keyof AnswerFields,
      label: 'Оливковое масло (ст.л. в день)',
      hint: '0-4 столовых ложек',
      max: 4,
    },
    {
      key: 'nuts' as keyof AnswerFields,
      label: 'Орехи (порций в неделю)',
      hint: '0-3 порций',
      max: 3,
    },
  ];

  const handleInputChange = (key: keyof AnswerFields, value: string): void => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const num = parseFloat(numericValue);

    if (numericValue === '' || (!isNaN(num) && num >= 0)) {
      setAnswers({
        ...answers,
        [key]: numericValue,
      });
    }
  };

  const handleCalculate = async (): Promise<void> => {
    if (!user) {
      Alert.alert('Ошибка', 'Пользователь не найден');
      return;
    }

    const emptyFields = fields.filter(
      (field) => !answers[field.key] || answers[field.key] === ''
    );

    if (emptyFields.length > 0) {
      Alert.alert('Внимание', 'Пожалуйста, заполните все поля');
      return;
    }

    const numericAnswers: CalculatorAnswers = {} as CalculatorAnswers;

    for (const field of fields) {
      const value = parseFloat(answers[field.key]);

      if (isNaN(value) || value < 0 || value > field.max) {
        Alert.alert(
          'Ошибка',
          `Поле "${field.label}" должно быть от 0 до ${field.max}`
        );
        return;
      }

      numericAnswers[field.key] = value;
    }

    try {
      const result = await api.createCalculation(numericAnswers);

      router.push({
        pathname: '/result',
        params: {
          score: result.score.toString(),
          interpretation: JSON.stringify(result.interpretation),
        },
      });
    } catch (error: any) {
      console.error('Calculation error:', error);
      const errorMessage = error.message || 'Не удалось выполнить расчет. Попробуйте еще раз.';
      Alert.alert('Ошибка', errorMessage);
    }
  };

  const handleClear = (): void => {
    Alert.alert(
      'Очистить форму',
      'Вы уверены, что хотите очистить все поля?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => {
            setAnswers({
              vegetables: '',
              fruits: '',
              legumes: '',
              cereals: '',
              fish: '',
              meat: '',
              dairy: '',
              alcohol: '',
              oliveOil: '',
              nuts: '',
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ backgroundColor: "#f5f5f5", padding: 16, borderRadius: 16, alignItems: "center" }}>
          <MaterialCommunityIcons name="hand-heart-outline" size={50} color="#007AFF" />
        </View>


        <Text style={styles.title}>
          Калькулятор средиземноморской диеты
        </Text>

        <Text style={styles.subtitle}>
          Заполните все поля для расчета индекса вашего рациона
        </Text>

        {fields.map((field) => (
          <View key={field.key} style={styles.inputContainer}>
            <Text style={styles.label}>{field.label}</Text>
            <Text style={styles.hint}>{field.hint}</Text>
            <TextInput
              style={styles.input}
              placeholder={`0-${field.max}`}
              value={answers[field.key]}
              onChangeText={(value) => handleInputChange(field.key, value)}
              keyboardType="numeric"
            />
          </View>
        ))}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={handleCalculate}
          >
            <Text style={styles.buttonText}>Рассчитать</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
          >
            <Text style={styles.clearButtonText}>Очистить</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 100,
    paddingBottom: 100,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    paddingBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  calculateButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CalculatorScreen;
