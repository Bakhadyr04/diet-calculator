import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Interpretation, CalculatorAnswers } from '../types';

export default function ResultScreen() {
  const params = useLocalSearchParams();

  const score =
    typeof params.score === 'string'
      ? Number(params.score)
      : null;

  let parsedInterpretation: Interpretation | null = null;
  let parsedAnswers: CalculatorAnswers | null = null;

  if (typeof params.interpretation === 'string') {
    try {
      parsedInterpretation = JSON.parse(params.interpretation);
    } catch (error) {
      console.error('Ошибка парсинга interpretation:', error);
      parsedInterpretation = null;
    }
  }

  if (typeof params.answers === 'string') {
    try {
      parsedAnswers = JSON.parse(params.answers);
    } catch (error) {
      console.error('Ошибка парсинга answers:', error);
      parsedAnswers = null;
    }
  }

  const getScoreColor = (value: number): string => {
    if (value >= 80) return '#27ae60';
    if (value >= 60) return '#3498db';
    if (value >= 40) return '#f39c12';
    return '#e74c3c';
  };

  if (score === null || !parsedInterpretation) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Ошибка: данные не найдены
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/tabs')}
          >
            <Text style={styles.buttonText}>
              Вернуться к калькулятору
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            Результат расчета
          </Text>

          <View
            style={[
              styles.scoreContainer,
              { borderColor: getScoreColor(score) },
            ]}
          >
            <Text style={styles.scoreLabel}>
              Индекс средиземноморской диеты
            </Text>
            <Text
              style={[
                styles.scoreValue,
                { color: getScoreColor(score) },
              ]}
            >
              {score} / 100
            </Text>
          </View>

          <View style={styles.interpretationContainer}>
            <Text style={styles.interpretationTitle}>
              Оценка: {parsedInterpretation.level}
            </Text>

            <Text style={styles.interpretationDescription}>
              {parsedInterpretation.description}
            </Text>

            <Text style={styles.recommendationsTitle}>
              Рекомендации:
            </Text>

            {parsedInterpretation.recommendations.map(
              (rec, index) => (
                <View
                  key={index}
                  style={styles.recommendationItem}
                >
                  <Text style={styles.recommendationBullet}>
                    •
                  </Text>
                  <Text style={styles.recommendationText}>
                    {rec}
                  </Text>
                </View>
              )
            )}
          </View>

          {parsedAnswers && (
            <View style={styles.answersContainer}>
              <Text style={styles.answersTitle}>
                Введенные данные:
              </Text>
              <View style={styles.answersGrid}>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Овощи:</Text>
                  <Text style={styles.answerValue}>{parsedAnswers.vegetables} порций/неделю</Text>
                </View>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Фрукты:</Text>
                  <Text style={styles.answerValue}>{parsedAnswers.fruits} порций/неделю</Text>
                </View>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Бобовые:</Text>
                  <Text style={styles.answerValue}>{parsedAnswers.legumes} порций/неделю</Text>
                </View>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Злаки:</Text>
                  <Text style={styles.answerValue}>{parsedAnswers.cereals} порций/неделю</Text>
                </View>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Рыба:</Text>
                  <Text style={styles.answerValue}>{parsedAnswers.fish} порций/неделю</Text>
                </View>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Мясо:</Text>
                  <Text style={styles.answerValue}>{parsedAnswers.meat} порций/неделю</Text>
                </View>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Молочные продукты:</Text>
                  <Text style={styles.answerValue}>{parsedAnswers.dairy} порций/неделю</Text>
                </View>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Алкоголь:</Text>
                  <Text style={styles.answerValue}>{parsedAnswers.alcohol} бокалов/неделю</Text>
                </View>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Оливковое масло:</Text>
                  <Text style={styles.answerValue}>{parsedAnswers.oliveOil} ст.л./неделю</Text>
                </View>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>Орехи:</Text>
                  <Text style={styles.answerValue}>{parsedAnswers.nuts} порций/неделю</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/tabs')}
            >
              <Text style={styles.buttonText}>
                Новый расчет
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
              ]}
              onPress={() => router.push('/tabs/history')}
            >
              <Text
                style={[
                  styles.buttonText,
                  styles.secondaryButtonText,
                ]}
              >
                История расчетов
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 100,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    borderWidth: 3,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  interpretationContainer: {
    marginBottom: 24,
  },
  interpretationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  interpretationDescription: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recommendationBullet: {
    fontSize: 16,
    color: '#3498db',
    marginRight: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 16,
    color: '#34495e',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#3498db',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  answersContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  answersGrid: {
    gap: 8,
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  answerLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  answerValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
});
