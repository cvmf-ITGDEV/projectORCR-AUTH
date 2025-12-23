'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Skeleton,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  RateReview as ReviewIcon,
  ArrowBack as BackIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { LoanApplication, STATUS_COLORS, ApplicationStatus } from '@/types';
import {
  getBarangayById,
  getCityById,
  getProvinceById,
  getRegionById,
} from '@/lib/psgc-data';
import { format } from 'date-fns';

const statusSteps = ['Draft', 'Submitted', 'Under Review', 'Decision'];

function getActiveStep(status: ApplicationStatus): number {
  switch (status) {
    case 'DRAFT':
      return 0;
    case 'SUBMITTED':
      return 1;
    case 'UNDER_REVIEW':
      return 2;
    case 'APPROVED':
    case 'REJECTED':
      return 3;
    default:
      return 0;
  }
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'review' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setApplication(data.application);
        } else {
          setError('Application not found');
        }
      } catch {
        setError('Failed to load application');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchApplication();
    }
  }, [params.id]);

  const handleAction = async () => {
    if (!actionType || !application) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/applications/${application.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          rejectionReason: actionType === 'reject' ? rejectionReason : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
        setActionDialogOpen(false);
        setRejectionReason('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update application status');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFullAddress = (barangayId: string, streetAddress?: string) => {
    const barangay = getBarangayById(barangayId);
    if (!barangay) return streetAddress || '';

    const city = getCityById(barangay.cityId);
    const province = city ? getProvinceById(city.provinceId) : null;
    const region = province ? getRegionById(province.regionId) : null;

    const parts = [streetAddress, barangay.name, city?.name, province?.name, region?.name].filter(
      Boolean
    );
    return parts.join(', ');
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    const labels: Record<ApplicationStatus, string> = {
      DRAFT: 'Draft',
      SUBMITTED: 'Submitted',
      UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    };
    return labels[status];
  };

  const canApprove = user?.role === 'ADMIN' && application?.status === 'UNDER_REVIEW';
  const canReview = application?.status === 'SUBMITTED';

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="rectangular" height={400} sx={{ mt: 2, borderRadius: 2 }} />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !application) {
    return (
      <DashboardLayout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Application not found'}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => router.push('/applications')}>
          Back to Applications
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
          <MuiLink component={NextLink} href="/applications" color="inherit" underline="hover">
            Applications
          </MuiLink>
          <Typography color="text.primary">{application.applicationNumber}</Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {application.applicationNumber}
              </Typography>
              <Chip
                label={getStatusLabel(application.status)}
                color={STATUS_COLORS[application.status]}
              />
            </Box>
            <Typography variant="body1" color="text.secondary">
              {application.firstName} {application.middleName} {application.lastName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {canReview && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<ReviewIcon />}
                onClick={() => {
                  setActionType('review');
                  setActionDialogOpen(true);
                }}
              >
                Mark Under Review
              </Button>
            )}
            {canApprove && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={() => {
                    setActionType('approve');
                    setActionDialogOpen(true);
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() => {
                    setActionType('reject');
                    setActionDialogOpen(true);
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            {application.status === 'APPROVED' && (
              <Button
                variant="contained"
                startIcon={<ReceiptIcon />}
                onClick={() => router.push(`/receipts/new?applicationId=${application.id}`)}
              >
                Generate Receipt
              </Button>
            )}
            <Button variant="outlined" startIcon={<PrintIcon />}>
              Print
            </Button>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Application Status
        </Typography>
        <Stepper activeStep={getActiveStep(application.status)} alternativeLabel sx={{ mt: 3 }}>
          {statusSteps.map((label, index) => (
            <Step
              key={label}
              completed={index < getActiveStep(application.status)}
            >
              <StepLabel
                error={
                  index === 3 && application.status === 'REJECTED'
                }
                StepIconProps={{
                  sx:
                    index === 3 && application.status === 'APPROVED'
                      ? { color: 'success.main' }
                      : index === 3 && application.status === 'REJECTED'
                      ? { color: 'error.main' }
                      : {},
                }}
              >
                {index === 3
                  ? application.status === 'APPROVED'
                    ? 'Approved'
                    : application.status === 'REJECTED'
                    ? 'Rejected'
                    : label
                  : label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {application.rejectionReason && (
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Rejection Reason:
            </Typography>
            {application.rejectionReason}
          </Alert>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>Full Name</TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>
                    {application.firstName} {application.middleName} {application.lastName}{' '}
                    {application.suffix}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>
                    Date of Birth
                  </TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>
                    {format(new Date(application.dateOfBirth), 'MMMM dd, yyyy')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>Gender</TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>{application.gender}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>
                    Civil Status
                  </TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>
                    {application.civilStatus}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>Email</TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>
                    {application.email || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>Mobile</TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>
                    {application.mobileNumber}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>Address</TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>
                    {getFullAddress(application.barangayId, application.streetAddress)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Employment & Income
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>Status</TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>
                    {application.employmentStatus}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>Employer</TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>
                    {application.employerName || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>Position</TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>
                    {application.position || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>
                    Monthly Income
                  </TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>
                    PHP {Number(application.monthlyIncome).toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>
                    Other Income
                  </TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>
                    {application.otherIncome
                      ? `PHP ${Number(application.otherIncome).toLocaleString()}`
                      : '-'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Loan Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Loan Purpose
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {application.loanPurpose}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Loan Amount
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  PHP {Number(application.loanAmount).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Term
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {application.loanTerm} months
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Interest Rate
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {Number(application.interestRate)}% p.a.
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Monthly Payment
                </Typography>
                <Typography variant="h6" fontWeight={600} color="success.main">
                  PHP {Number(application.monthlyPayment || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' && 'Approve Application'}
          {actionType === 'reject' && 'Reject Application'}
          {actionType === 'review' && 'Mark as Under Review'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'approve' &&
              'Are you sure you want to approve this loan application? This action will notify the applicant and allow receipt generation.'}
            {actionType === 'reject' &&
              'Are you sure you want to reject this loan application? Please provide a reason for rejection.'}
            {actionType === 'review' &&
              'This will mark the application as "Under Review" and notify relevant processors.'}
          </DialogContentText>
          {actionType === 'reject' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color={actionType === 'reject' ? 'error' : actionType === 'approve' ? 'success' : 'primary'}
            disabled={isProcessing || (actionType === 'reject' && !rejectionReason)}
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
