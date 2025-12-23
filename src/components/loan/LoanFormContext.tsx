'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { LoanApplicationFormData } from '@/types';

const initialFormData: LoanApplicationFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  dateOfBirth: '',
  gender: '',
  civilStatus: '',
  nationality: 'Filipino',
  email: '',
  mobileNumber: '',
  telephoneNumber: '',
  streetAddress: '',
  regionId: '',
  provinceId: '',
  cityId: '',
  barangayId: '',
  zipCode: '',
  sameAsPresent: true,
  permanentStreetAddress: '',
  permanentRegionId: '',
  permanentProvinceId: '',
  permanentCityId: '',
  permanentBarangayId: '',
  permanentZipCode: '',
  employmentStatus: '',
  employerName: '',
  employerAddress: '',
  position: '',
  yearsEmployed: '',
  monthlyIncome: '',
  otherIncome: '',
  incomeSource: '',
  loanPurpose: '',
  loanAmount: '',
  loanTerm: '',
  interestRate: '12',
  coMakerName: '',
  coMakerAddress: '',
  coMakerContact: '',
  coMakerRelationship: '',
  validIdType: '',
  validIdNumber: '',
  validIdExpiry: '',
};

interface LoanFormContextType {
  formData: LoanApplicationFormData;
  currentStep: number;
  applicationId: string | null;
  isDraft: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  updateFormData: (data: Partial<LoanApplicationFormData>) => void;
  setCurrentStep: (step: number) => void;
  setApplicationId: (id: string | null) => void;
  setIsDraft: (isDraft: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  resetForm: () => void;
  loadDraft: (data: Partial<LoanApplicationFormData>, id: string) => void;
}

const LoanFormContext = createContext<LoanFormContextType | undefined>(undefined);

export function LoanFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<LoanApplicationFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = useCallback((data: Partial<LoanApplicationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(0);
    setApplicationId(null);
    setIsDraft(false);
    setErrors({});
  }, []);

  const loadDraft = useCallback((data: Partial<LoanApplicationFormData>, id: string) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setApplicationId(id);
    setIsDraft(true);
  }, []);

  return (
    <LoanFormContext.Provider
      value={{
        formData,
        currentStep,
        applicationId,
        isDraft,
        isSubmitting,
        errors,
        updateFormData,
        setCurrentStep,
        setApplicationId,
        setIsDraft,
        setIsSubmitting,
        setErrors,
        resetForm,
        loadDraft,
      }}
    >
      {children}
    </LoanFormContext.Provider>
  );
}

export function useLoanForm() {
  const context = useContext(LoanFormContext);
  if (context === undefined) {
    throw new Error('useLoanForm must be used within a LoanFormProvider');
  }
  return context;
}
