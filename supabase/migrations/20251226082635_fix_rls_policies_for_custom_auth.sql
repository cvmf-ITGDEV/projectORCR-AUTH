/*
  # Fix RLS Policies for Custom Authentication

  ## Overview
  This migration updates RLS policies to work with custom JWT authentication
  instead of Supabase Auth. Since the application handles authentication and
  authorization at the application layer, we configure policies to allow
  access for authenticated database connections.

  ## Changes
  
  ### Policy Updates
  - Remove `auth.uid()` dependencies (Supabase Auth specific)
  - Allow access for authenticated postgres role (service role)
  - Keep RLS enabled for security
  - Application layer will enforce authorization rules

  ## Security Model
  
  The application uses:
  - Custom JWT tokens for user authentication
  - Role-based access control (PROCESSOR, APPROVER, ADMIN)
  - Session management at application level
  
  RLS is enabled to prevent direct database access, but policies
  allow the application's database connection to perform operations.
  Authorization checks are enforced in the application code.

  ## Important Notes
  - RLS remains enabled for all tables (security requirement)
  - Policies allow authenticated connections (postgres role)
  - Application enforces user-level authorization
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view active users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view loan applications" ON loan_applications;
DROP POLICY IF EXISTS "Authenticated users can create loan applications" ON loan_applications;
DROP POLICY IF EXISTS "Authenticated users can update loan applications" ON loan_applications;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can view receipts" ON receipts;
DROP POLICY IF EXISTS "Authenticated users can create receipts" ON receipts;
DROP POLICY IF EXISTS "Receipt issuer can update receipts" ON receipts;
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can create audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated users can read settings" ON system_settings;
DROP POLICY IF EXISTS "Anyone can view regions" ON regions;
DROP POLICY IF EXISTS "Anyone can view provinces" ON provinces;
DROP POLICY IF EXISTS "Anyone can view cities" ON cities;
DROP POLICY IF EXISTS "Anyone can view barangays" ON barangays;

-- Users table policies
CREATE POLICY "Allow authenticated access to users"
  ON users FOR ALL
  TO postgres
  USING (true)
  WITH CHECK (true);

-- Loan applications table policies
CREATE POLICY "Allow authenticated access to loan applications"
  ON loan_applications FOR ALL
  TO postgres
  USING (true)
  WITH CHECK (true);

-- Documents table policies
CREATE POLICY "Allow authenticated access to documents"
  ON documents FOR ALL
  TO postgres
  USING (true)
  WITH CHECK (true);

-- Receipts table policies
CREATE POLICY "Allow authenticated access to receipts"
  ON receipts FOR ALL
  TO postgres
  USING (true)
  WITH CHECK (true);

-- Audit logs table policies
CREATE POLICY "Allow authenticated access to audit logs"
  ON audit_logs FOR ALL
  TO postgres
  USING (true)
  WITH CHECK (true);

-- System settings table policies
CREATE POLICY "Allow authenticated access to system settings"
  ON system_settings FOR ALL
  TO postgres
  USING (true)
  WITH CHECK (true);

-- PSGC tables policies
CREATE POLICY "Allow read access to regions"
  ON regions FOR SELECT
  TO postgres
  USING (true);

CREATE POLICY "Allow read access to provinces"
  ON provinces FOR SELECT
  TO postgres
  USING (true);

CREATE POLICY "Allow read access to cities"
  ON cities FOR SELECT
  TO postgres
  USING (true);

CREATE POLICY "Allow read access to barangays"
  ON barangays FOR SELECT
  TO postgres
  USING (true);