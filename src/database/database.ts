import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "bizman_router2.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER NOT NULL,
          amount REAL NOT NULL CHECK (amount > 0),
          date TEXT NOT NULL,
          FOREIGN KEY (client_id)
            REFERENCES clients(id)
            ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_sales_client_date
          ON sales(client_id, date DESC);
      `);

      return db;
    })().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}
