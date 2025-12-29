import 'server-only';
import { prisma } from './db';

export interface SystemSettings {
  defaultInterestRate: number;
  minimumLoanAmount: number;
  maximumLoanAmount: number;
  applicationFee: number;
  processingFeePercentage: number;
  emailNotificationsEnabled: boolean;
  maintenanceMode: boolean;
  businessHours: {
    start: string;
    end: string;
    days: string;
  };
  contactEmail: string;
  contactPhone: string;
  termsVersion: string;
  privacyPolicyVersion: string;
  maxLoanTermMonths: number;
  latePaymentPenaltyPercentage: number;
  companyName: string;
}

const CACHE_TTL = 5 * 60 * 1000;

let settingsCache: {
  data: SystemSettings | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

type SettingValue = number | boolean | string | { start: string; end: string; days: string };

function parseSettingValue(key: string, value: string): SettingValue {
  switch (key) {
    case 'default_interest_rate':
    case 'minimum_loan_amount':
    case 'maximum_loan_amount':
    case 'application_fee':
    case 'processing_fee_percentage':
    case 'max_loan_term_months':
    case 'late_payment_penalty_percentage':
      return parseFloat(value);

    case 'email_notifications_enabled':
    case 'maintenance_mode':
      return value === 'true';

    case 'business_hours':
      try {
        return JSON.parse(value);
      } catch {
        return { start: '08:00', end: '17:00', days: 'Monday-Friday' };
      }

    default:
      return value;
  }
}

function mapSettingsToObject(settings: Array<{ key: string; value: string }>): SystemSettings {
  const settingsMap = new Map(settings.map(s => [s.key, s.value]));

  return {
    defaultInterestRate: parseSettingValue('default_interest_rate', settingsMap.get('default_interest_rate') || '8.5') as number,
    minimumLoanAmount: parseSettingValue('minimum_loan_amount', settingsMap.get('minimum_loan_amount') || '5000') as number,
    maximumLoanAmount: parseSettingValue('maximum_loan_amount', settingsMap.get('maximum_loan_amount') || '1000000') as number,
    applicationFee: parseSettingValue('application_fee', settingsMap.get('application_fee') || '500') as number,
    processingFeePercentage: parseSettingValue('processing_fee_percentage', settingsMap.get('processing_fee_percentage') || '2.5') as number,
    emailNotificationsEnabled: parseSettingValue('email_notifications_enabled', settingsMap.get('email_notifications_enabled') || 'true') as boolean,
    maintenanceMode: parseSettingValue('maintenance_mode', settingsMap.get('maintenance_mode') || 'false') as boolean,
    businessHours: parseSettingValue('business_hours', settingsMap.get('business_hours') || '{"start":"08:00","end":"17:00","days":"Monday-Friday"}') as { start: string; end: string; days: string },
    contactEmail: settingsMap.get('contact_email') || 'support@lending.ph',
    contactPhone: settingsMap.get('contact_phone') || '+63-2-1234-5678',
    termsVersion: settingsMap.get('terms_version') || '1.0',
    privacyPolicyVersion: settingsMap.get('privacy_policy_version') || '1.0',
    maxLoanTermMonths: parseSettingValue('max_loan_term_months', settingsMap.get('max_loan_term_months') || '36') as number,
    latePaymentPenaltyPercentage: parseSettingValue('late_payment_penalty_percentage', settingsMap.get('late_payment_penalty_percentage') || '5') as number,
    companyName: settingsMap.get('company_name') || 'Philippine Lending Corporation',
  };
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const now = Date.now();

  if (settingsCache.data && (now - settingsCache.timestamp) < CACHE_TTL) {
    return settingsCache.data;
  }

  try {
    const settings = await prisma.systemSetting.findMany({
      select: {
        key: true,
        value: true,
      },
    });

    const mappedSettings = mapSettingsToObject(settings);

    settingsCache = {
      data: mappedSettings,
      timestamp: now,
    };

    return mappedSettings;
  } catch (error) {
    console.error('Failed to fetch system settings:', error);

    if (settingsCache.data) {
      console.warn('Using cached settings due to database error');
      return settingsCache.data;
    }

    console.warn('Using default settings');
    return getDefaultSettings();
  }
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
      select: { value: true },
    });

    return setting?.value || null;
  } catch (error) {
    console.error(`Failed to fetch setting: ${key}`, error);
    return null;
  }
}

export async function updateSetting(key: string, value: string): Promise<void> {
  try {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value, updatedAt: new Date() },
      create: { key, value },
    });

    clearSettingsCache();
  } catch (error) {
    console.error(`Failed to update setting: ${key}`, error);
    throw new Error(`Failed to update system setting: ${key}`);
  }
}

export async function updateSettings(settings: Record<string, string>): Promise<void> {
  try {
    await prisma.$transaction(
      Object.entries(settings).map(([key, value]) =>
        prisma.systemSetting.upsert({
          where: { key },
          update: { value, updatedAt: new Date() },
          create: { key, value },
        })
      )
    );

    clearSettingsCache();
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw new Error('Failed to update system settings');
  }
}

export function clearSettingsCache(): void {
  settingsCache = {
    data: null,
    timestamp: 0,
  };
}

export function getDefaultSettings(): SystemSettings {
  return {
    defaultInterestRate: 8.5,
    minimumLoanAmount: 5000,
    maximumLoanAmount: 1000000,
    applicationFee: 500,
    processingFeePercentage: 2.5,
    emailNotificationsEnabled: true,
    maintenanceMode: false,
    businessHours: {
      start: '08:00',
      end: '17:00',
      days: 'Monday-Friday',
    },
    contactEmail: 'support@lending.ph',
    contactPhone: '+63-2-1234-5678',
    termsVersion: '1.0',
    privacyPolicyVersion: '1.0',
    maxLoanTermMonths: 36,
    latePaymentPenaltyPercentage: 5,
    companyName: 'Philippine Lending Corporation',
  };
}

export async function ensureSystemSettingsExist(): Promise<void> {
  try {
    const count = await prisma.systemSetting.count();

    if (count === 0) {
      console.log('No system settings found, initializing with defaults...');

      const defaultSettings = getDefaultSettings();
      const settingsToCreate = [
        { key: 'default_interest_rate', value: defaultSettings.defaultInterestRate.toString() },
        { key: 'minimum_loan_amount', value: defaultSettings.minimumLoanAmount.toString() },
        { key: 'maximum_loan_amount', value: defaultSettings.maximumLoanAmount.toString() },
        { key: 'application_fee', value: defaultSettings.applicationFee.toString() },
        { key: 'processing_fee_percentage', value: defaultSettings.processingFeePercentage.toString() },
        { key: 'email_notifications_enabled', value: defaultSettings.emailNotificationsEnabled.toString() },
        { key: 'maintenance_mode', value: defaultSettings.maintenanceMode.toString() },
        { key: 'business_hours', value: JSON.stringify(defaultSettings.businessHours) },
        { key: 'contact_email', value: defaultSettings.contactEmail },
        { key: 'contact_phone', value: defaultSettings.contactPhone },
        { key: 'terms_version', value: defaultSettings.termsVersion },
        { key: 'privacy_policy_version', value: defaultSettings.privacyPolicyVersion },
        { key: 'max_loan_term_months', value: defaultSettings.maxLoanTermMonths.toString() },
        { key: 'late_payment_penalty_percentage', value: defaultSettings.latePaymentPenaltyPercentage.toString() },
        { key: 'company_name', value: defaultSettings.companyName },
      ];

      await prisma.systemSetting.createMany({
        data: settingsToCreate,
      });

      console.log(`Initialized ${settingsToCreate.length} system settings`);
    }
  } catch (error) {
    console.error('Failed to ensure system settings exist:', error);
  }
}
