import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ListRenderItem,
} from 'react-native';
import { router } from 'expo-router';

import { getCalculationsByUserId } from '../../database/database';
import { useUserContext } from '../../context/UserContext';
import { Calculation, Interpretation, CalculatorAnswers } from '../../types';

export default function HistoryScreen() {
  const { user } = useUserContext();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadCalculations = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getCalculationsByUserId(user.id);
      setCalculations(data);
    } catch (error) {
      console.error('Error loading calculations:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить историю расчетов');
    } finally {
      setLoading(false);
    }
  };

  loadCalculations();
}, [user]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#3498db';
    if (score >= 40) return '#f39c12';
    return '#e74c3c';
  };

  const handleItemPress = (item: Calculation): void => {
    try {
      const interpretation: Interpretation = JSON.parse(item.interpretation);
      const answers: CalculatorAnswers = JSON.parse(item.calculation_data);

      router.push({
        pathname: '/result',
        params: {
          score: item.score.toString(),
          interpretation: JSON.stringify(interpretation),
          answers: JSON.stringify(answers),
        },
      });
    } catch (error) {
      console.error('Error parsing interpretation:', error);
    }
  };

  const renderItem: ListRenderItem<Calculation> = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleItemPress(item)}>
      <View style={styles.itemHeader}>
        <View
          style={[
            styles.scoreBadge,
            { backgroundColor: getScoreColor(item.score) },
          ]}
        >
          <Text style={styles.scoreText}>{item.score}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
      </View>
      <Text style={styles.itemSubtext}>
        Нажмите для просмотра деталей
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (calculations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>История расчетов пуста</Text>
          <Text style={styles.emptySubtext}>
            Выполните расчет на главной странице
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/tabs')}
          >
            <Text style={styles.buttonText}>Перейти к калькулятору</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>История расчетов</Text>
      <Text style={styles.subtitle}>
        Всего расчетов: {calculations.length}
      </Text>
      <FlatList
        data={calculations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    padding: 20,
    paddingTop: 100,
    paddingBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    paddingHorizontal: 20,
    paddingBottom: 15,
    textAlign: 'center',

  },
  list: { padding: 20 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreBadge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  scoreText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  dateText: { fontSize: 14, color: '#7f8c8d' },
  itemSubtext: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    paddingHorizontal: 32,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
