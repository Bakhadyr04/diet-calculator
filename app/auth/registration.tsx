import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';

import { insertUser, getUserByEmail, getUserById } from '../../database/database';
import { useUserContext } from '../../context/UserContext';

export default function RegistrationScreen() {
  const { setUserData } = useUserContext();

  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState<Date>(new Date());
  const [dateInput, setDateInput] = useState(() => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  });
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11 && digits.startsWith('7');
  };

  const formatPhoneNumber = (text: string): string => {
    // Удаляем все нецифровые символы
    const digits = text.replace(/\D/g, '');
    
    // Если начинается не с 7, добавляем 7
    let phoneDigits = digits;
    if (phoneDigits.length > 0 && !phoneDigits.startsWith('7')) {
      phoneDigits = '7' + phoneDigits;
    }
    
    // Ограничиваем до 11 цифр (7 + 10)
    phoneDigits = phoneDigits.substring(0, 11);
    
    // Форматируем: +7 (XXX) XXX-XX-XX
    if (phoneDigits.length === 0) {
      return '';
    }
    if (phoneDigits.length <= 1) {
      return `+${phoneDigits}`;
    }
    if (phoneDigits.length <= 4) {
      return `+7 (${phoneDigits.substring(1)}`;
    }
    if (phoneDigits.length <= 7) {
      return `+7 (${phoneDigits.substring(1, 4)}) ${phoneDigits.substring(4)}`;
    }
    if (phoneDigits.length <= 9) {
      return `+7 (${phoneDigits.substring(1, 4)}) ${phoneDigits.substring(4, 7)}-${phoneDigits.substring(7)}`;
    }
    return `+7 (${phoneDigits.substring(1, 4)}) ${phoneDigits.substring(4, 7)}-${phoneDigits.substring(7, 9)}-${phoneDigits.substring(9)}`;
  };

  const handlePhoneChange = (text: string): void => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  const handlePhoneFocus = (): void => {
    if (!phone || phone === '') {
      setPhone('+7');
    }
  };

  const parseDateFromInput = (dateString: string): Date | null => {
    // Пробуем разные форматы: DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD
    const formats = [
      /^(\d{2})\.(\d{2})\.(\d{4})$/,
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      /^(\d{4})-(\d{2})-(\d{2})$/,
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        let day: number, month: number, year: number;
        if (format === formats[2]) {
          // YYYY-MM-DD
          year = parseInt(match[1], 10);
          month = parseInt(match[2], 10) - 1;
          day = parseInt(match[3], 10);
        } else {
          // DD.MM.YYYY или DD/MM/YYYY
          day = parseInt(match[1], 10);
          month = parseInt(match[2], 10) - 1;
          year = parseInt(match[3], 10);
        }
        const date = new Date(year, month, day);
        if (
          date.getFullYear() === year &&
          date.getMonth() === month &&
          date.getDate() === day
        ) {
          return date;
        }
      }
    }
    return null;
  };

  const handleDateInputChange = (text: string): void => {
    setDateInput(text);
    const parsed = parseDateFromInput(text);
    if (parsed) {
      setBirthDate(parsed);
    }
  };

  const handleDatePickerChange = (event: any, selectedDate?: Date): void => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBirthDate(selectedDate);
      setDateInput(formatDate(selectedDate));
    }
  };

  const handleRegister = async (): Promise<void> => {
    if (!fullName.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите ФИО');
      return;
    }

    // Проверяем дату
    const parsedDate = parseDateFromInput(dateInput);
    if (!parsedDate || parsedDate > new Date()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректную дату рождения');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректный email');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректный номер телефона');
      return;
    }

    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        Alert.alert('Ошибка', 'Пользователь с таким email уже существует');
        return;
      }

      const finalDate = parsedDate || birthDate;
      const userId = await insertUser(
        fullName.trim(),
        finalDate.toISOString().split('T')[0],
        phone.trim(),
        email.trim()
      );

      const userData = await getUserById(userId);
      if (userData) {
        await setUserData(userData);
        Alert.alert('Успех', 'Регистрация завершена успешно!', [
          {
            text: 'OK',
            onPress: () => router.replace('/tabs'),
          },
        ]);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Ошибка', 'Не удалось зарегистрироваться. Попробуйте еще раз.');
    }
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.subtitle}>Заполните все поля для регистрации</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>ФИО</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите ваше полное имя"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Дата рождения</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateInput}
                placeholder="DD.MM.YYYY"
                value={dateInput}
                onChangeText={handleDateInputChange}
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.calendarButtonText}>📅</Text>
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={birthDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={handleDatePickerChange}
              />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
              <TouchableOpacity
                style={styles.closePickerButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.closePickerText}>Готово</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Телефон</Text>
            <TextInput
              style={styles.input}
              placeholder="+7 (999) 123-45-67"
              value={phone}
              onChangeText={handlePhoneChange}
              onFocus={handlePhoneFocus}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@mail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Зарегистрироваться</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.linkText}>
              Уже есть аккаунт? Войти
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: { marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  calendarButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarButtonText: {
    fontSize: 20,
  },
  closePickerButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#3498db',
    borderRadius: 8,
    alignItems: 'center',
  },
  closePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#3498db',
    fontSize: 14,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
});
