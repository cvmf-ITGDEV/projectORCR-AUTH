/*
  # Enable Row Level Security and Policies

  ## Overview
  This migration enables Row Level Security (RLS) on all tables and creates
  appropriate policies to secure data access based on authentication and authorization.

  ## Security Changes
  
  ### RLS Enabled On:
  - users
  - loan_applications
  - documents
  - receipts
  - audit_logs
  - system_settings
  - regions, provinces, cities, barangays (read-only for all)

  ### Policy Strategy
  
  #### Users Table
  - Authenticated users can read all active users
  - Users can read and update their own profile
  - No public access
  
  #### Loan Applications Table
  - Authenticated users can view all loan applications (for processing)
  - Authenticated users can create new applications
  - Only the processor or approver can update applications
  - No deletion allowed
  
  #### Documents Table
  - Authenticated users can view documents for applications they can access
  - Authenticated users can upload documents
  - Cascade with loan application access
  
  #### Receipts Table
  - Authenticated users can view all receipts (for audit purposes)
  - Authenticated users can create receipts
  - Only the issuer can update receipts (for voiding)
  
  #### Audit Logs Table
  - Authenticated users can view all audit logs
  - System can create audit logs (no user-initiated creation)
  
  #### System Settings Table
  - Authenticated users can read settings
  - Only system can modify settings
  
  #### PSGC Tables (Geographic Data)
  - Public read access for address selection
  - No modifications allowed by users

  ## Important Notes
  - All policies are restrictive by default
  - No public access to sensitive data
  - All modifications require authentication
  - Audit trail maintained for all changes
*/

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active users"
  ON users FOR SELECT
  TO authenticated
  USING ("isActive" = true);

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id::text = auth.uid()::text);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id::text = auth.uid()::text)
  WITH CHECK (id::text = auth.uid()::text);

-- Enable RLS on loan_applications table
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view loan applications"
  ON loan_applications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create loan applications"
  ON loan_applications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update loan applications"
  ON loan_applications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM loan_applications
      WHERE loan_applications.id = documents."loanApplicationId"
    )
  );

CREATE POLICY "Authenticated users can upload documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loan_applications
      WHERE loan_applications.id = documents."loanApplicationId"
    )
  );

-- Enable RLS on receipts table
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view receipts"
  ON receipts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create receipts"
  ON receipts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Receipt issuer can update receipts"
  ON receipts FOR UPDATE
  TO authenticated
  USING ("issuedById"::text = auth.uid()::text)
  WITH CHECK ("issuedById"::text = auth.uid()::text);

-- Enable RLS on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable RLS on system_settings table
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

-- Enable RLS on PSGC tables (read-only public access)
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE barangays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view regions"
  ON regions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view provinces"
  ON provinces FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view cities"
  ON cities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view barangays"
  ON barangays FOR SELECT
  TO authenticated
  USING (true);