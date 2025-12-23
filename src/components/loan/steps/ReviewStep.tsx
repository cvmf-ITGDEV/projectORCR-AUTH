'use client';

import { useMemo } from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AccountBalance as LoanIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useLoanForm } from '../LoanFormContext';
import {
  getBarangayById,
  getCityById,
  getProvinceById,
  getRegionById,
} from '@/lib/psgc-data';
import { format } from 'date-fns';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <Paper elevation={0} sx={{ mb: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {icon}
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Paper>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <TableRow>
      <TableCell sx={{ border: 'none', py: 1, color: 'text.secondary', width: '40%' }}>
        {label}
      </TableCell>
      <TableCell sx={{ border: 'none', py: 1, fontWeight: 500 }}>
        {value || '-'}
      </TableCell>
    </TableRow>
  );
}

export default function ReviewStep() {
  const { formData } = useLoanForm();

  const presentAddress = useMemo(() => {
    const barangay = getBarangayById(formData.barangayId);
    const city = getCityById(formData.cityId);
    const province = getProvinceById(formData.provinceId);
    const region = getRegionById(formData.regionId);

    const parts = [
      formData.streetAddress,
      barangay?.name,
      city?.name,
      province?.name,
      region?.name,
      formData.zipCode,
    ].filter(Boolean);

    return parts.join(', ');
  }, [formData]);

  const permanentAddress = useMemo(() => {
    if (formData.sameAsPresent) return 'Same as Present Address';

    const barangay = getBarangayById(formData.permanentBarangayId);
    const city = getCityById(formData.permanentCityId);
    const province = getProvinceById(formData.permanentProvinceId);
    const region = getRegionById(formData.permanentRegionId);

    const parts = [
      formData.permanentStreetAddress,
      barangay?.name,
      city?.name,
      province?.name,
      region?.name,
      formData.permanentZipCode,
    ].filter(Boolean);

    return parts.join(', ');
  }, [formData]);

  const loanCalculation = useMemo(() => {
    const principal = parseFloat(formData.loanAmount) || 0;
    const rate = parseFloat(formData.interestRate) || 0;
    const term = parseInt(formData.loanTerm) || 1;

    const totalInterest = principal * (rate / 100) * (term / 12);
    const totalAmount = principal + totalInterest;
    const monthlyPayment = totalAmount / term;

    return {
      principal,
      totalInterest,
      totalAmount,
      monthlyPayment,
    };
  }, [formData.loanAmount, formData.interestRate, formData.loanTerm]);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Review Your Application
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please review all the information before submitting your loan application.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }} icon={<CheckIcon />}>
        Verify that all information is correct. Once submitted, you will not be able to edit
        the application unless it is returned for revision.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Section title="Personal Information" icon={<PersonIcon color="primary" />}>
            <Table size="small">
              <TableBody>
                <InfoRow
                  label="Full Name"
                  value={`${formData.firstName} ${formData.middleName} ${formData.lastName} ${formData.suffix}`.trim()}
                />
                <InfoRow
                  label="Date of Birth"
                  value={formData.dateOfBirth ? format(new Date(formData.dateOfBirth), 'MMMM dd, yyyy') : ''}
                />
                <InfoRow label="Gender" value={formData.gender} />
                <InfoRow label="Civil Status" value={formData.civilStatus} />
                <InfoRow label="Nationality" value={formData.nationality} />
                <InfoRow label="Email" value={formData.email} />
                <InfoRow label="Mobile Number" value={formData.mobileNumber} />
                <InfoRow label="Telephone" value={formData.telephoneNumber} />
              </TableBody>
            </Table>
          </Section>

          <Section title="Address Information" icon={<LocationIcon color="primary" />}>
            <Typography variant="caption" color="text.secondary">
              Present Address
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {presentAddress}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Permanent Address
            </Typography>
            <Typography variant="body2">
              {permanentAddress}
            </Typography>
          </Section>

          <Section title="Co-Maker & ID" icon={<PeopleIcon color="primary" />}>
            <Table size="small">
              <TableBody>
                <InfoRow label="Co-Maker Name" value={formData.coMakerName} />
                <InfoRow label="Relationship" value={formData.coMakerRelationship} />
                <InfoRow label="Co-Maker Address" value={formData.coMakerAddress} />
                <InfoRow label="Co-Maker Contact" value={formData.coMakerContact} />
              </TableBody>
            </Table>
            <Divider sx={{ my: 2 }} />
            <Table size="small">
              <TableBody>
                <InfoRow label="Valid ID Type" value={formData.validIdType} />
                <InfoRow label="ID Number" value={formData.validIdNumber} />
                <InfoRow
                  label="ID Expiry"
                  value={formData.validIdExpiry ? format(new Date(formData.validIdExpiry), 'MMMM dd, yyyy') : ''}
                />
              </TableBody>
            </Table>
          </Section>
        </Grid>

        <Grid item xs={12} md={6}>
          <Section title="Employment & Income" icon={<WorkIcon color="primary" />}>
            <Table size="small">
              <TableBody>
                <InfoRow label="Employment Status" value={formData.employmentStatus} />
                <InfoRow label="Employer/Business" value={formData.employerName} />
                <InfoRow label="Employer Address" value={formData.employerAddress} />
                <InfoRow label="Position" value={formData.position} />
                <InfoRow label="Years Employed" value={formData.yearsEmployed} />
                <InfoRow
                  label="Monthly Income"
                  value={`PHP ${parseFloat(formData.monthlyIncome || '0').toLocaleString()}`}
                />
                <InfoRow
                  label="Other Income"
                  value={
                    formData.otherIncome
                      ? `PHP ${parseFloat(formData.otherIncome).toLocaleString()}`
                      : '-'
                  }
                />
                <InfoRow label="Income Source" value={formData.incomeSource} />
              </TableBody>
            </Table>
          </Section>

          <Section title="Loan Details" icon={<LoanIcon color="primary" />}>
            <Table size="small">
              <TableBody>
                <InfoRow label="Loan Purpose" value={formData.loanPurpose} />
                <InfoRow
                  label="Loan Amount"
                  value={`PHP ${loanCalculation.principal.toLocaleString()}`}
                />
                <InfoRow label="Loan Term" value={`${formData.loanTerm} months`} />
                <InfoRow label="Interest Rate" value={`${formData.interestRate}% per annum`} />
              </TableBody>
            </Table>

            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Total Interest
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    PHP {loanCalculation.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Total Payable
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    PHP {loanCalculation.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Monthly Payment
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  PHP {loanCalculation.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Paper>
          </Section>
        </Grid>
      </Grid>
    </Box>
  );
}
