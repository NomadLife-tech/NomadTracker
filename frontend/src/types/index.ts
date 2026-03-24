// Visit - Core travel record
export interface Visit {
  id: string;
  countryCode: string;           // ISO 2-letter code (e.g., "US", "DE")
  countryName: string;
  entryDate: string;             // ISO date string
  exitDate?: string;             // Optional - null means currently there
  visaType: string;              // Country-specific visa type
  visaNumber?: string;           // Optional visa reference number
  allowedDays?: number;          // Visa duration limit
  passportId?: string;           // Reference to passport used
  notes?: string;                // Free-form notes
  createdAt: string;
  updatedAt: string;
}

// Attachment - File attachment with metadata
export interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'jpg' | 'png';
  mimeType: string;
  size: number;                   // File size in bytes
  uri: string;                    // Local URI or base64 data
  createdAt: string;
}

// Passport - Travel document
export interface Passport {
  id: string;
  type: 'primary' | 'secondary' | 'tertiary';
  countryCode: string;
  countryName: string;
  passportNumber: string;
  issueDate: string;
  expiryDate: string;
  attachments?: Attachment[];     // Multiple attachments (PDF, JPG, PNG)
  documentAttachment?: string;    // Legacy: base64 encoded image
}

// Insurance - Health/travel coverage
export interface Insurance {
  id: string;
  type: 'medical' | 'travel';
  provider: string;
  policyNumber: string;
  phone?: string;
  notes?: string;
  attachments?: Attachment[];     // Multiple attachments (PDF, JPG, PNG)
  attachment?: string;            // Legacy: base64 encoded image
}

// User Profile
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;               // base64 or preset emoji
  avatarType: 'preset' | 'custom';
  passports: Passport[];         // Max 3 passports
  insurances: Insurance[];       // Unlimited
  createdAt: string;
  updatedAt: string;
}

// App Settings
export interface AppSettings {
  darkMode: boolean;
  language: SupportedLanguage;
  // Visa Expiration Alerts
  visaAlertsEnabled: boolean;
  visaAlertDays: number[];          // e.g., [90, 60, 30, 15, 10, 7]
  customAlertDays?: number;         // Custom days before expiration
  alertFrequency: 'once' | 'daily' | 'weekly';
  // Cloud Save
  cloudSaveEnabled: boolean;
}

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja' | 'ko';

// Country definition
export interface Country {
  code: string;                  // ISO 2-letter
  name: string;
  flag: string;                  // Emoji flag
  visaTypes: string[];           // Country-specific visa options
  isSchengen?: boolean;
}

// Emergency & Visa Resources
export interface CountryInfo {
  emergencyNumbers: {
    police: string;
    ambulance: string;
    fire: string;
    general?: string;
    tourist?: string;
  };
  visaResources: Array<{
    name: string;
    url: string;
    type: 'visa' | 'consulate' | 'embassy' | 'immigration';
  }>;
  currencyCode: string;
  drivingSide: 'left' | 'right';
  timezone: string;
}

// Calculated statuses
export interface VisaStatus {
  visit: Visit;
  daysUsed: number;
  daysRemaining: number;
  percentageUsed: number;        // 0-100
  isActive: boolean;
  isOverstay: boolean;
}

export interface SchengenStatus {
  daysUsedInPeriod: number;      // Within 180-day window
  daysRemainingInPeriod: number; // Out of 90 allowed
  periodStartDate: string;
  periodEndDate: string;
}

// App State
export interface AppState {
  visits: Visit[];
  profile: UserProfile;
  settings: AppSettings;
  isLoading: boolean;
}
