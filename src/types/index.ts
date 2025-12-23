export type Role = 'ADMIN' | 'PROCESSOR';

export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type ReceiptType = 'OFFICIAL_RECEIPT' | 'COLLECTION_RECEIPT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
}

export interface AuthUser extends User {
  token: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface Province {
  id: string;
  name: string;
  regionId: string;
}

export interface City {
  id: string;
  name: string;
  provinceId: string;
}

export interface Barangay {
  id: string;
  name: string;
  cityId: string;
}

export interface LoanApplicationFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  dateOfBirth: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  email: string;
  mobileNumber: string;
  telephoneNumber: string;
  streetAddress: string;
  regionId: string;
  provinceId: string;
  cityId: string;
  barangayId: string;
  zipCode: string;
  sameAsPresent: boolean;
  permanentStreetAddress: string;
  permanentRegionId: string;
  permanentProvinceId: string;
  permanentCityId: string;
  permanentBarangayId: string;
  permanentZipCode: string;
  employmentStatus: string;
  employerName: string;
  employerAddress: string;
  position: string;
  yearsEmployed: string;
  monthlyIncome: string;
  otherIncome: string;
  incomeSource: string;
  loanPurpose: string;
  loanAmount: string;
  loanTerm: string;
  interestRate: string;
  coMakerName: string;
  coMakerAddress: string;
  coMakerContact: string;
  coMakerRelationship: string;
  validIdType: string;
  validIdNumber: string;
  validIdExpiry: string;
}

export interface LoanApplication {
  id: string;
  applicationNumber: string;
  status: ApplicationStatus;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  dateOfBirth: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  email?: string;
  mobileNumber: string;
  telephoneNumber?: string;
  streetAddress: string;
  barangayId: string;
  barangay?: Barangay & { city?: City & { province?: Province & { region?: Region } } };
  zipCode?: string;
  sameAsPresent: boolean;
  permanentStreetAddress?: string;
  permanentBarangayId?: string;
  permanentZipCode?: string;
  employmentStatus: string;
  employerName?: string;
  employerAddress?: string;
  position?: string;
  yearsEmployed?: number;
  monthlyIncome: number;
  otherIncome?: number;
  incomeSource?: string;
  loanPurpose: string;
  loanAmount: number;
  loanTerm: number;
  interestRate: number;
  monthlyPayment?: number;
  coMakerName?: string;
  coMakerAddress?: string;
  coMakerContact?: string;
  coMakerRelationship?: string;
  validIdType?: string;
  validIdNumber?: string;
  validIdExpiry?: string;
  remarks?: string;
  rejectionReason?: string;
  processedBy?: User;
  approvedBy?: User;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  receiptType: ReceiptType;
  amount: number;
  paymentMethod: string;
  paymentDetails?: string;
  purpose: string;
  payerName: string;
  payerAddress?: string;
  remarks?: string;
  loanApplicationId?: string;
  loanApplication?: LoanApplication;
  issuedBy: User;
  issuedAt: string;
  voidedAt?: string;
  voidedReason?: string;
}

export interface DashboardStats {
  totalApplications: number;
  draftApplications: number;
  submittedApplications: number;
  underReviewApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalReceipts: number;
  totalReceiptAmount: number;
  recentApplications: LoanApplication[];
  recentReceipts: Receipt[];
}

export const LOAN_STEPS = [
  'Personal Information',
  'Address Details',
  'Employment & Income',
  'Loan Details',
  'Co-Maker Information',
  'Review & Submit',
] as const;

export const GENDERS = ['Male', 'Female'] as const;

export const CIVIL_STATUSES = ['Single', 'Married', 'Widowed', 'Separated', 'Divorced'] as const;

export const EMPLOYMENT_STATUSES = [
  'Employed',
  'Self-Employed',
  'OFW',
  'Retired',
  'Student',
  'Unemployed',
] as const;

export const LOAN_PURPOSES = [
  'Personal Loan',
  'Business Loan',
  'Educational Loan',
  'Medical Loan',
  'Home Improvement',
  'Vehicle Loan',
  'Debt Consolidation',
  'Emergency',
  'Others',
] as const;

export const LOAN_TERMS = [6, 12, 18, 24, 36, 48, 60] as const;

export const VALID_ID_TYPES = [
  'Philippine Passport',
  "Driver's License",
  'SSS ID',
  'GSIS ID',
  'PRC ID',
  'Postal ID',
  "Voter's ID",
  'PhilHealth ID',
  'TIN ID',
  'Barangay ID',
  'National ID',
] as const;

export const PAYMENT_METHODS = ['Cash', 'Check', 'Bank Transfer', 'Online Payment'] as const;

export const STATUS_COLORS: Record<ApplicationStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};
