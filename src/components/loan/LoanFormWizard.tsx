'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Save as SaveIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { LoanFormProvider, useLoanForm } from './LoanFormContext';
import PersonalInfoStep from './steps/PersonalInfoStep';
import AddressStep from './steps/AddressStep';
import EmploymentStep from './steps/EmploymentStep';
import LoanDetailsStep from './steps/LoanDetailsStep';
import CoMakerStep from './steps/CoMakerStep';
import ReviewStep from './steps/ReviewStep';
import { LOAN_STEPS } from '@/types';

const steps = LOAN_STEPS;

const stepComponents = [
  PersonalInfoStep,
  AddressStep,
  EmploymentStep,
  LoanDetailsStep,
  CoMakerStep,
  ReviewStep,
];

function LoanFormContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const {
    formData,
    currentStep,
    applicationId,
    isSubmitting,
    setCurrentStep,
    setIsSubmitting,
    setErrors,
    resetForm,
  } = useLoanForm();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.firstName) errors.firstName = 'First name is required';
        if (!formData.lastName) errors.lastName = 'Last name is required';
        if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) errors.gender = 'Gender is required';
        if (!formData.civilStatus) errors.civilStatus = 'Civil status is required';
        if (!formData.mobileNumber) errors.mobileNumber = 'Mobile number is required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Invalid email format';
        }
        break;
      case 1:
        if (!formData.streetAddress) errors.streetAddress = 'Street address is required';
        if (!formData.regionId) errors.regionId = 'Region is required';
        if (!formData.provinceId) errors.provinceId = 'Province is required';
        if (!formData.cityId) errors.cityId = 'City is required';
        if (!formData.barangayId) errors.barangayId = 'Barangay is required';
        break;
      case 2:
        if (!formData.employmentStatus) errors.employmentStatus = 'Employment status is required';
        if (['Employed', 'Self-Employed', 'OFW'].includes(formData.employmentStatus)) {
          if (!formData.employerName) errors.employerName = 'Employer name is required';
          if (!formData.position) errors.position = 'Position is required';
        }
        if (!formData.monthlyIncome) errors.monthlyIncome = 'Monthly income is required';
        break;
      case 3:
        if (!formData.loanPurpose) errors.loanPurpose = 'Loan purpose is required';
        if (!formData.loanAmount) errors.loanAmount = 'Loan amount is required';
        if (parseFloat(formData.loanAmount) < 10000) {
          errors.loanAmount = 'Minimum loan amount is PHP 10,000';
        }
        if (!formData.loanTerm) errors.loanTerm = 'Loan term is required';
        break;
      case 4:
        if (parseFloat(formData.loanAmount) > 50000 && !formData.coMakerName) {
          errors.coMakerName = 'Co-maker is required for loans above PHP 50,000';
        }
        break;
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/applications', {
        method: applicationId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: applicationId,
          status: 'DRAFT',
        }),
      });

      if (response.ok) {
        setAlertMessage({ type: 'success', message: 'Application saved as draft successfully!' });
        setSaveDialogOpen(false);
        setTimeout(() => {
          router.push('/applications');
        }, 1500);
      } else {
        const data = await response.json();
        setAlertMessage({ type: 'error', message: data.error || 'Failed to save draft' });
      }
    } catch {
      setAlertMessage({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    for (let i = 0; i < steps.length - 1; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        setSubmitDialogOpen(false);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/applications', {
        method: applicationId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: applicationId,
          status: 'SUBMITTED',
        }),
      });

      if (response.ok) {
        setAlertMessage({ type: 'success', message: 'Application submitted successfully!' });
        setSubmitDialogOpen(false);
        resetForm();
        setTimeout(() => {
          router.push('/applications');
        }, 1500);
      } else {
        const data = await response.json();
        setAlertMessage({ type: 'error', message: data.error || 'Failed to submit application' });
      }
    } catch {
      setAlertMessage({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepComponent = stepComponents[currentStep];

  return (
    <Box>
      {alertMessage && (
        <Alert
          severity={alertMessage.type}
          sx={{ mb: 3 }}
          onClose={() => setAlertMessage(null)}
        >
          {alertMessage.message}
        </Alert>
      )}

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Stepper
          activeStep={currentStep}
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 3 }}>
        <StepComponent />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={currentStep === 0}
              startIcon={<BackIcon />}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setSaveDialogOpen(true)}
              startIcon={<SaveIcon />}
              disabled={isSubmitting}
            >
              Save Draft
            </Button>
          </Box>

          <Box>
            {currentStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setSubmitDialogOpen(true)}
                endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                disabled={isSubmitting}
              >
                Submit Application
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ForwardIcon />}
              >
                Continue
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save as Draft</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your application will be saved as a draft. You can continue editing it later from your
            applications list.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSaveDraft} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={20} /> : 'Save Draft'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)}>
        <DialogTitle>Submit Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to submit this loan application? Once submitted, you will not be
            able to make changes unless it is returned for revision.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function LoanFormWizard() {
  return (
    <LoanFormProvider>
      <LoanFormContent />
    </LoanFormProvider>
  );
}
