'use client';

import { useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { useLoanForm } from '../LoanFormContext';
import {
  regions,
  getProvincesByRegion,
  getCitiesByProvince,
  getBarangaysByCity,
} from '@/lib/psgc-data';
import { Province, City, Barangay } from '@/types';

export default function AddressStep() {
  const { formData, updateFormData, errors } = useLoanForm();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [permProvinces, setPermProvinces] = useState<Province[]>([]);
  const [permCities, setPermCities] = useState<City[]>([]);
  const [permBarangays, setPermBarangays] = useState<Barangay[]>([]);

  useEffect(() => {
    if (formData.regionId) {
      setProvinces(getProvincesByRegion(formData.regionId));
    }
  }, [formData.regionId]);

  useEffect(() => {
    if (formData.provinceId) {
      setCities(getCitiesByProvince(formData.provinceId));
    }
  }, [formData.provinceId]);

  useEffect(() => {
    if (formData.cityId) {
      setBarangays(getBarangaysByCity(formData.cityId));
    }
  }, [formData.cityId]);

  useEffect(() => {
    if (formData.permanentRegionId) {
      setPermProvinces(getProvincesByRegion(formData.permanentRegionId));
    }
  }, [formData.permanentRegionId]);

  useEffect(() => {
    if (formData.permanentProvinceId) {
      setPermCities(getCitiesByProvince(formData.permanentProvinceId));
    }
  }, [formData.permanentProvinceId]);

  useEffect(() => {
    if (formData.permanentCityId) {
      setPermBarangays(getBarangaysByCity(formData.permanentCityId));
    }
  }, [formData.permanentCityId]);

  const handleRegionChange = (value: string) => {
    updateFormData({
      regionId: value,
      provinceId: '',
      cityId: '',
      barangayId: '',
    });
    setProvinces(getProvincesByRegion(value));
    setCities([]);
    setBarangays([]);
  };

  const handleProvinceChange = (value: string) => {
    updateFormData({
      provinceId: value,
      cityId: '',
      barangayId: '',
    });
    setCities(getCitiesByProvince(value));
    setBarangays([]);
  };

  const handleCityChange = (value: string) => {
    updateFormData({
      cityId: value,
      barangayId: '',
    });
    setBarangays(getBarangaysByCity(value));
  };

  const handlePermRegionChange = (value: string) => {
    updateFormData({
      permanentRegionId: value,
      permanentProvinceId: '',
      permanentCityId: '',
      permanentBarangayId: '',
    });
    setPermProvinces(getProvincesByRegion(value));
    setPermCities([]);
    setPermBarangays([]);
  };

  const handlePermProvinceChange = (value: string) => {
    updateFormData({
      permanentProvinceId: value,
      permanentCityId: '',
      permanentBarangayId: '',
    });
    setPermCities(getCitiesByProvince(value));
    setPermBarangays([]);
  };

  const handlePermCityChange = (value: string) => {
    updateFormData({
      permanentCityId: value,
      permanentBarangayId: '',
    });
    setPermBarangays(getBarangaysByCity(value));
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Address Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide your present and permanent address using the Philippine Standard Geographic Code (PSGC).
      </Typography>

      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocationIcon />
          <Typography variant="subtitle1" fontWeight={600}>
            Present Address
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Where you currently reside
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="House No. / Street / Building"
            value={formData.streetAddress}
            onChange={(e) => updateFormData({ streetAddress: e.target.value })}
            error={!!errors.streetAddress}
            helperText={errors.streetAddress}
            placeholder="Enter complete street address"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.regionId}>
            <InputLabel>Region</InputLabel>
            <Select
              value={formData.regionId}
              label="Region"
              onChange={(e) => handleRegionChange(e.target.value)}
            >
              {regions.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.provinceId} disabled={!formData.regionId}>
            <InputLabel>Province</InputLabel>
            <Select
              value={formData.provinceId}
              label="Province"
              onChange={(e) => handleProvinceChange(e.target.value)}
            >
              {provinces.map((province) => (
                <MenuItem key={province.id} value={province.id}>
                  {province.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.cityId} disabled={!formData.provinceId}>
            <InputLabel>City / Municipality</InputLabel>
            <Select
              value={formData.cityId}
              label="City / Municipality"
              onChange={(e) => handleCityChange(e.target.value)}
            >
              {cities.map((city) => (
                <MenuItem key={city.id} value={city.id}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.barangayId} disabled={!formData.cityId}>
            <InputLabel>Barangay</InputLabel>
            <Select
              value={formData.barangayId}
              label="Barangay"
              onChange={(e) => updateFormData({ barangayId: e.target.value })}
            >
              {barangays.map((barangay) => (
                <MenuItem key={barangay.id} value={barangay.id}>
                  {barangay.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="ZIP Code"
            value={formData.zipCode}
            onChange={(e) => updateFormData({ zipCode: e.target.value })}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'grey.100', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
              Permanent Address
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.sameAsPresent}
                onChange={(e) => updateFormData({ sameAsPresent: e.target.checked })}
                color="primary"
              />
            }
            label="Same as present address"
          />
        </Paper>

        {!formData.sameAsPresent && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="House No. / Street / Building"
                value={formData.permanentStreetAddress}
                onChange={(e) => updateFormData({ permanentStreetAddress: e.target.value })}
                placeholder="Enter complete street address"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Region</InputLabel>
                <Select
                  value={formData.permanentRegionId}
                  label="Region"
                  onChange={(e) => handlePermRegionChange(e.target.value)}
                >
                  {regions.map((region) => (
                    <MenuItem key={region.id} value={region.id}>
                      {region.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={!formData.permanentRegionId}>
                <InputLabel>Province</InputLabel>
                <Select
                  value={formData.permanentProvinceId}
                  label="Province"
                  onChange={(e) => handlePermProvinceChange(e.target.value)}
                >
                  {permProvinces.map((province) => (
                    <MenuItem key={province.id} value={province.id}>
                      {province.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={!formData.permanentProvinceId}>
                <InputLabel>City / Municipality</InputLabel>
                <Select
                  value={formData.permanentCityId}
                  label="City / Municipality"
                  onChange={(e) => handlePermCityChange(e.target.value)}
                >
                  {permCities.map((city) => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={!formData.permanentCityId}>
                <InputLabel>Barangay</InputLabel>
                <Select
                  value={formData.permanentBarangayId}
                  label="Barangay"
                  onChange={(e) => updateFormData({ permanentBarangayId: e.target.value })}
                >
                  {permBarangays.map((barangay) => (
                    <MenuItem key={barangay.id} value={barangay.id}>
                      {barangay.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.permanentZipCode}
                onChange={(e) => updateFormData({ permanentZipCode: e.target.value })}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
