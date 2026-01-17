/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';

import { getUserStatistics } from '../../database/database';
import { useUserContext } from '../../context/UserContext';
import { UserStatistics as UserStatsType } from '../../types';

export default function ProfileScreen() {
  const { user, logout } = useUserContext();
  const [statistics, setStatistics] = useState<UserStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      const stats = await getUserStatistics(user.id);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Нет данных';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = async (): Promise<void> => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Пользователь не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.pageTitle}>Профиль</Text>
      <View style={styles.profileCard}>
        <Text style={styles.sectionTitle}>Личные данные</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ФИО:</Text>
          <Text style={styles.infoValue}>{user.full_name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Дата рождения:</Text>
          <Text style={styles.infoValue}>
            {new Date(user.birth_date).toLocaleDateString('ru-RU')}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Телефон:</Text>
          <Text style={styles.infoValue}>{user.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Статистика расчетов</Text>

        {loading ? (
          <Text style={styles.loadingText}>Загрузка...</Text>
        ) : statistics && statistics.total_calculations > 0 ? (
          <>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Всего расчетов:</Text>
              <Text style={styles.statValue}>
                {statistics.total_calculations}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Средний индекс:</Text>
              <Text style={styles.statValue}>
                {statistics.average_score
                  ? Math.round(statistics.average_score * 10) / 10
                  : 'Нет данных'}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Первый расчет:</Text>
              <Text style={styles.statValue}>
                {formatDate(statistics.first_calculation)}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Последний расчет:</Text>
              <Text style={styles.statValue}>
                {formatDate(statistics.last_calculation)}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.noDataText}>Нет данных о расчетах</Text>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 20, paddingTop: 100, },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingBottom: 30,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoLabel: { fontSize: 16, color: '#7f8c8d', fontWeight: '500' },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  statLabel: { fontSize: 16, color: '#7f8c8d' },
  statValue: { fontSize: 16, color: '#2c3e50', fontWeight: '600' },
  loadingText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 40,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
