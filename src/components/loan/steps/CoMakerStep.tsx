'use client';

import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  InputAdornment,
  Paper,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { useLoanForm } from '../LoanFormContext';
import { VALID_ID_TYPES } from '@/types';

export default function CoMakerStep() {
  const { formData, updateFormData, errors } = useLoanForm();

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Co-Maker & Identification
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide co-maker details and valid identification for verification.
      </Typography>

      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PeopleIcon />
          <Typography variant="subtitle1" fontWeight={600}>
            Co-Maker Information
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          A co-maker serves as a guarantor for your loan application
        </Typography>
      </Paper>

      <Alert severity="info" sx={{ mb: 3 }}>
        A co-maker is required for loan amounts above PHP 50,000. The co-maker must be of legal age and should not be
        your immediate family member.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Co-Maker Full Name"
            value={formData.coMakerName}
            onChange={(e) => updateFormData({ coMakerName: e.target.value })}
            error={!!errors.coMakerName}
            helperText={errors.coMakerName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Relationship to Applicant"
            value={formData.coMakerRelationship}
            onChange={(e) => updateFormData({ coMakerRelationship: e.target.value })}
            placeholder="e.g., Friend, Colleague, etc."
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Co-Maker Address"
            value={formData.coMakerAddress}
            onChange={(e) => updateFormData({ coMakerAddress: e.target.value })}
            placeholder="Complete address of co-maker"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Co-Maker Contact Number"
            value={formData.coMakerContact}
            onChange={(e) => updateFormData({ coMakerContact: e.target.value })}
            placeholder="09XX XXX XXXX"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, mt: 4, mb: 3, backgroundColor: 'grey.100', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <BadgeIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            Applicant&apos;s Valid ID
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Provide details of at least one valid government-issued ID
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Valid ID Type</InputLabel>
            <Select
              value={formData.validIdType}
              label="Valid ID Type"
              onChange={(e) => updateFormData({ validIdType: e.target.value })}
            >
              {VALID_ID_TYPES.map((idType) => (
                <MenuItem key={idType} value={idType}>
                  {idType}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="ID Number"
            value={formData.validIdNumber}
            onChange={(e) => updateFormData({ validIdNumber: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="ID Expiry Date"
            type="date"
            value={formData.validIdExpiry}
            onChange={(e) => updateFormData({ validIdExpiry: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: new Date().toISOString().split('T')[0],
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
