import 'server-only';

export interface DatabaseConfig {
  url: string;
  provider: 'postgresql' | 'sqlserver';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface AuthConfig {
  jwtSecret: string;
}

export interface AppConfig {
  nodeEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isWebContainer: boolean;
  isStackBlitz: boolean;
}

export interface Config {
  database: DatabaseConfig;
  supabase: SupabaseConfig;
  auth: AuthConfig;
  app: AppConfig;
}

function validateRequired(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Please check your .env file and ensure ${name} is set.\n` +
      `See .env.example for reference.`
    );
  }
  return value;
}

function getDatabaseProvider(url: string): 'postgresql' | 'sqlserver' {
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return 'postgresql';
  }
  if (url.startsWith('sqlserver://')) {
    return 'sqlserver';
  }
  throw new Error(
    `Unsupported database provider in DATABASE_URL.\n` +
    `Supported providers: postgresql://, postgres://, sqlserver://`
  );
}

function loadDatabaseConfig(): DatabaseConfig {
  const url = validateRequired(process.env.DATABASE_URL, 'DATABASE_URL');
  const provider = getDatabaseProvider(url);

  return { url, provider };
}

function loadSupabaseConfig(): SupabaseConfig {
  const url = validateRequired(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_URL'
  );

  const anonKey = validateRequired(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );

  if (!url.startsWith('https://')) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL must start with https://\n' +
      `Got: ${url}`
    );
  }

  return { url, anonKey };
}

function loadAuthConfig(): AuthConfig {
  const jwtSecret = validateRequired(process.env.JWT_SECRET, 'JWT_SECRET');

  if (jwtSecret.length < 32) {
    console.warn(
      'WARNING: JWT_SECRET is shorter than 32 characters.\n' +
      'For production use, generate a secure random string:\n' +
      'openssl rand -base64 32'
    );
  }

  return { jwtSecret };
}

function loadAppConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const isDevelopment = nodeEnv === 'development';
  const isWebContainer = process.env.WEB_CONTAINER === 'true';
  const isStackBlitz = process.env.STACKBLITZ === 'true';

  return {
    nodeEnv,
    isProduction,
    isDevelopment,
    isWebContainer,
    isStackBlitz,
  };
}

function loadConfig(): Config {
  try {
    return {
      database: loadDatabaseConfig(),
      supabase: loadSupabaseConfig(),
      auth: loadAuthConfig(),
      app: loadAppConfig(),
    };
  } catch (error) {
    console.error('Configuration Error:', error instanceof Error ? error.message : error);
    throw error;
  }
}

export const config = loadConfig();

export function getConnectionInfo(): string {
  const { database, app } = config;
  return `Environment: ${app.nodeEnv} | Database: ${database.provider}`;
}

export function isSupabaseConfigured(): boolean {
  try {
    const { url, anonKey } = config.supabase;
    return Boolean(url && anonKey && url.startsWith('https://'));
  } catch {
    return false;
  }
}

export function validateConfiguration(): void {
  console.log('Validating configuration...');
  console.log(`  - ${getConnectionInfo()}`);
  console.log(`  - Supabase configured: ${isSupabaseConfigured()}`);
  console.log(`  - Web Container mode: ${config.app.isWebContainer}`);
  console.log('Configuration validation passed ✓');
}
