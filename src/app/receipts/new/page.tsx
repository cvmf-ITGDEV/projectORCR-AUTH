'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Receipt as ReceiptIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PAYMENT_METHODS, LoanApplication } from '@/types';

function NewReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId');

  const [formData, setFormData] = useState({
    receiptType: 'OFFICIAL_RECEIPT' as 'OFFICIAL_RECEIPT' | 'COLLECTION_RECEIPT',
    amount: '',
    paymentMethod: '',
    paymentDetails: '',
    purpose: '',
    payerName: '',
    payerAddress: '',
    remarks: '',
    loanApplicationId: applicationId || '',
  });

  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (applicationId) {
      const fetchApplication = async () => {
        try {
          const response = await fetch(`/api/applications/${applicationId}`);
          if (response.ok) {
            const data = await response.json();
            setApplication(data.application);
            setFormData((prev) => ({
              ...prev,
              payerName: `${data.application.firstName} ${data.application.lastName}`,
              amount: data.application.loanAmount.toString(),
              purpose: `Loan Disbursement - ${data.application.applicationNumber}`,
            }));
          }
        } catch {
          console.error('Failed to fetch application');
        }
      };
      fetchApplication();
    }
  }, [applicationId]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/receipts');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create receipt');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <MuiLink
            component={NextLink}
            href="/dashboard"
            color="inherit"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </MuiLink>
          <MuiLink component={NextLink} href="/receipts" color="inherit" underline="hover">
            Receipts
          </MuiLink>
          <Typography color="text.primary">Issue New Receipt</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          Issue New Receipt
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create an Official Receipt (OR) or Collection Receipt (CR)
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Receipt created successfully! Redirecting...
        </Alert>
      )}

      {application && (
        <Card sx={{ mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
              Linked Application
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {application.applicationNumber}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {application.firstName} {application.lastName} - PHP{' '}
              {Number(application.loanAmount).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 4, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <ReceiptIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Receipt Information
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Receipt Type</InputLabel>
                <Select
                  value={formData.receiptType}
                  label="Receipt Type"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      receiptType: e.target.value as 'OFFICIAL_RECEIPT' | 'COLLECTION_RECEIPT',
                    }))
                  }
                >
                  <MenuItem value="OFFICIAL_RECEIPT">Official Receipt (OR)</MenuItem>
                  <MenuItem value="COLLECTION_RECEIPT">Collection Receipt (CR)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={handleChange('amount')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">PHP</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  label="Payment Method"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))
                  }
                >
                  {PAYMENT_METHODS.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Details"
                value={formData.paymentDetails}
                onChange={handleChange('paymentDetails')}
                placeholder="Check number, reference number, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Purpose"
                value={formData.purpose}
                onChange={handleChange('purpose')}
                placeholder="e.g., Loan Disbursement, Monthly Payment, etc."
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Payer Information
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Payer Name"
                value={formData.payerName}
                onChange={handleChange('payerName')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payer Address"
                value={formData.payerAddress}
                onChange={handleChange('payerAddress')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarks"
                value={formData.remarks}
                onChange={handleChange('remarks')}
                placeholder="Additional notes or comments"
              />
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => router.push('/receipts')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Receipt'}
          </Button>
        </Box>
      </form>
    </>
  );
}

function LoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

export default function NewReceiptPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingFallback />}>
        <NewReceiptContent />
      </Suspense>
    </DashboardLayout>
  );
}
