/*
  # Initial Database Schema Setup
  
  ## Overview
  This migration creates the complete database schema for the ORCR Loan Management System.
  It includes all necessary tables, relationships, and indexes for managing loan applications,
  receipts, Philippine address data (PSGC), users, and audit trails.
  
  ## Tables Created
  
  ### 1. users
  - Stores system users (loan processors, approvers)
  - Includes authentication credentials and role-based access control
  - Fields: id, email, password, firstName, lastName, role, isActive, timestamps
  
  ### 2. regions, provinces, cities, barangays
  - Philippine Standard Geographic Code (PSGC) hierarchy
  - Used for address selection in loan applications
  - Properly normalized with foreign key relationships
  
  ### 3. loan_applications
  - Core table for loan applications
  - Includes personal info, address, employment, loan details, co-maker info
  - Status tracking (DRAFT, SUBMITTED, APPROVED, REJECTED)
  - Links to barangay for address, users for processing/approval
  
  ### 4. documents
  - File attachments for loan applications
  - Stores metadata (filename, type, size, path)
  - Cascade deletes when loan application is removed
  
  ### 5. receipts
  - Payment receipts for loans and other transactions
  - Links to loan applications (optional)
  - Tracks issuer, payment method, and voiding
  
  ### 6. audit_logs
  - System-wide audit trail
  - Records all important actions with user context
  - Indexed for efficient querying by entity and time
  
  ### 7. system_settings
  - Application configuration key-value store
  - Used for system-wide settings
  
  ## Security
  - All UUID primary keys for security
  - Proper foreign key constraints
  - Indexes on frequently queried columns
  - NoAction on deletes to prevent accidental data loss for critical relations
  
  ## Notes
  - Uses PostgreSQL-specific features (uuid, timestamptz)
  - Decimal precision set to (18,2) for monetary values
  - Text type used for long-form content
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  role TEXT DEFAULT 'PROCESSOR' NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create regions table (PSGC Level 1)
CREATE TABLE IF NOT EXISTS regions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- Create provinces table (PSGC Level 2)
CREATE TABLE IF NOT EXISTS provinces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "regionId" TEXT NOT NULL,
  FOREIGN KEY ("regionId") REFERENCES regions(id)
);

-- Create cities table (PSGC Level 3)
CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "provinceId" TEXT NOT NULL,
  FOREIGN KEY ("provinceId") REFERENCES provinces(id)
);

-- Create barangays table (PSGC Level 4)
CREATE TABLE IF NOT EXISTS barangays (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "cityId" TEXT NOT NULL,
  FOREIGN KEY ("cityId") REFERENCES cities(id)
);

-- Create loan_applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "applicationNumber" TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'DRAFT' NOT NULL,
  
  "firstName" TEXT NOT NULL,
  "middleName" TEXT,
  "lastName" TEXT NOT NULL,
  suffix TEXT,
  "dateOfBirth" TIMESTAMPTZ NOT NULL,
  gender TEXT NOT NULL,
  "civilStatus" TEXT NOT NULL,
  nationality TEXT DEFAULT 'Filipino' NOT NULL,
  
  email TEXT,
  "mobileNumber" TEXT NOT NULL,
  "telephoneNumber" TEXT,
  
  "streetAddress" TEXT NOT NULL,
  "barangayId" TEXT NOT NULL,
  "zipCode" TEXT,
  
  "permanentStreetAddress" TEXT,
  "permanentBarangayId" TEXT,
  "permanentZipCode" TEXT,
  "sameAsPresent" BOOLEAN DEFAULT true NOT NULL,
  
  "employmentStatus" TEXT NOT NULL,
  "employerName" TEXT,
  "employerAddress" TEXT,
  position TEXT,
  "yearsEmployed" INTEGER,
  "monthlyIncome" DECIMAL(18, 2) NOT NULL,
  "otherIncome" DECIMAL(18, 2),
  "incomeSource" TEXT,
  
  "loanPurpose" TEXT NOT NULL,
  "loanAmount" DECIMAL(18, 2) NOT NULL,
  "loanTerm" INTEGER NOT NULL,
  "interestRate" DECIMAL(5, 2) NOT NULL,
  "monthlyPayment" DECIMAL(18, 2),
  
  "coMakerName" TEXT,
  "coMakerAddress" TEXT,
  "coMakerContact" TEXT,
  "coMakerRelationship" TEXT,
  
  "validIdType" TEXT,
  "validIdNumber" TEXT,
  "validIdExpiry" TIMESTAMPTZ,
  
  remarks TEXT,
  "rejectionReason" TEXT,
  
  "processedById" UUID,
  "approvedById" UUID,
  
  "submittedAt" TIMESTAMPTZ,
  "approvedAt" TIMESTAMPTZ,
  "rejectedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  FOREIGN KEY ("barangayId") REFERENCES barangays(id),
  FOREIGN KEY ("processedById") REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY ("approvedById") REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Create indexes for loan_applications
CREATE INDEX IF NOT EXISTS "loan_applications_applicationNumber_idx" ON loan_applications("applicationNumber");
CREATE INDEX IF NOT EXISTS "loan_applications_status_idx" ON loan_applications(status);
CREATE INDEX IF NOT EXISTS "loan_applications_createdAt_idx" ON loan_applications("createdAt");

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "fileName" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "filePath" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "loanApplicationId" UUID NOT NULL,
  "uploadedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  FOREIGN KEY ("loanApplicationId") REFERENCES loan_applications(id) ON DELETE CASCADE
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "receiptNumber" TEXT UNIQUE NOT NULL,
  "receiptType" TEXT NOT NULL,
  amount DECIMAL(18, 2) NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "paymentDetails" TEXT,
  purpose TEXT NOT NULL,
  "payerName" TEXT NOT NULL,
  "payerAddress" TEXT,
  remarks TEXT,
  
  "loanApplicationId" UUID,
  
  "issuedById" UUID NOT NULL,
  "issuedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  "voidedAt" TIMESTAMPTZ,
  "voidedReason" TEXT,
  
  FOREIGN KEY ("loanApplicationId") REFERENCES loan_applications(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY ("issuedById") REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Create indexes for receipts
CREATE INDEX IF NOT EXISTS "receipts_receiptNumber_idx" ON receipts("receiptNumber");
CREATE INDEX IF NOT EXISTS "receipts_issuedAt_idx" ON receipts("issuedAt");

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  action TEXT NOT NULL,
  changes TEXT,
  "userId" TEXT,
  "userEmail" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS "audit_logs_entity_idx" ON audit_logs("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON audit_logs("createdAt");

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);