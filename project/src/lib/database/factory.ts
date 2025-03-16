import { DatabaseConfig, DatabaseProvider } from './types';
import { SupabaseProvider } from './providers/supabase';

export function createDatabaseProvider(config: DatabaseConfig): DatabaseProvider {
  switch (config.provider) {
    case 'supabase':
      return new SupabaseProvider(config);
    case 'postgresql':
      throw new Error('PostgreSQL provider not implemented yet');
    case 'mysql':
      throw new Error('MySQL provider not implemented yet');
    default:
      throw new Error(`Unsupported database provider: ${config.provider}`);
  }
}

// Create a singleton instance
let databaseProvider: DatabaseProvider | null = null;

export function initializeDatabase(config: DatabaseConfig): void {
  if (databaseProvider) {
    throw new Error('Database already initialized');
  }
  databaseProvider = createDatabaseProvider(config);
}

export function getDatabase(): DatabaseProvider {
  if (!databaseProvider) {
    throw new Error('Database not initialized');
  }
  return databaseProvider;
} 