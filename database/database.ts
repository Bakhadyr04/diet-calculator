import * as SQLite from 'expo-sqlite';
import { User, Calculation, UserStatistics } from '../types';

export const db = SQLite.openDatabaseSync('diet_calculator.db');

/* =========================
   ИНИЦИАЛИЗАЦИЯ БАЗЫ
========================= */
export const initDatabase = async (): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      score REAL NOT NULL,
      interpretation TEXT,
      calculation_data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
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
  const result = await db.runAsync(
    `INSERT INTO users (full_name, birth_date, phone, email)
     VALUES (?, ?, ?, ?);`,
    [fullName, birthDate, phone, email]
  );
  return result.lastInsertRowId!;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return await db.getFirstAsync<User>(
    `SELECT * FROM users WHERE email = ?;`,
    [email]
  );
};

export const getUserById = async (id: number): Promise<User | null> => {
  return await db.getFirstAsync<User>(
    `SELECT * FROM users WHERE id = ?;`,
    [id]
  );
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
  const result = await db.runAsync(
    `INSERT INTO calculations (user_id, score, interpretation, calculation_data)
     VALUES (?, ?, ?, ?);`,
    [userId, score, interpretation, JSON.stringify(calculationData)]
  );
  return result.lastInsertRowId!;
};

export const getCalculationsByUserId = async (
  userId: number
): Promise<Calculation[]> => {
  return await db.getAllAsync<Calculation>(
    `SELECT * FROM calculations
     WHERE user_id = ?
     ORDER BY created_at DESC;`,
    [userId]
  );
};

/* =========================
   STATISTICS
========================= */
export const getUserStatistics = async (
  userId: number
): Promise<UserStatistics> => {
  const row = await db.getFirstAsync<any>(
    `SELECT
      COUNT(*) as total_calculations,
      MIN(created_at) as first_calculation,
      MAX(created_at) as last_calculation,
      AVG(score) as average_score
     FROM calculations
     WHERE user_id = ?;`,
    [userId]
  );

  return {
    total_calculations: row?.total_calculations ?? 0,
    first_calculation: row?.first_calculation ?? null,
    last_calculation: row?.last_calculation ?? null,
    average_score: row?.average_score ?? null,
  };
};
