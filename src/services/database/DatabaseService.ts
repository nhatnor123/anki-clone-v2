import * as SQLite from 'expo-sqlite';
import { initialSchemaMigration } from './migrations/001_initial_schema';

class DatabaseService {
    private db: SQLite.SQLiteDatabase | null = null;

    async initialize() {
        if (this.db) return;

        this.db = await SQLite.openDatabaseAsync('ankiclone.db');

        // Enable PRAGMAs for performance and foreign keys
        await this.db.execAsync('PRAGMA foreign_keys = ON;');
        await this.db.execAsync('PRAGMA journal_mode = WAL;');

        // Basic migration logic
        await this.runMigrations();
    }

    private async runMigrations() {
        if (!this.db) throw new Error('DB not initialized');

        try {
            const result = await this.db.getFirstAsync<{ version: number }>(
                'SELECT version FROM schema_info'
            );
            if (result && result.version >= 1) {
                return; // Already migrated
            }
        } catch (e) {
            // Table doesn't exist, we need to run initial migration
            await this.db.execAsync(initialSchemaMigration);
        }
    }

    getDb(): SQLite.SQLiteDatabase {
        if (!this.db) throw new Error('Database not initialized');
        return this.db;
    }

    async execute(sql: string, params: any[] = []): Promise<SQLite.SQLiteRunResult> {
        return this.getDb().runAsync(sql, params);
    }

    async query<T>(sql: string, params: any[] = []): Promise<T[]> {
        return this.getDb().getAllAsync<T>(sql, params);
    }

    async queryFirst<T>(sql: string, params: any[] = []): Promise<T | null> {
        return this.getDb().getFirstAsync<T>(sql, params);
    }
}

export const dbService = new DatabaseService();
