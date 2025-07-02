
import { AuditResult } from './types';
import { testSupabaseConnection } from './tests/connectionTest';
import { testEdgeFunctions } from './tests/edgeFunctionsTest';
import { testDatabaseTables } from './tests/databaseTablesTest';

// Re-export all test functions for backward compatibility
export { testSupabaseConnection, testEdgeFunctions, testDatabaseTables };
