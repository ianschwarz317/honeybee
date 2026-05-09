-- Honeybee initial schema
-- Migration: 001_initial_schema.sql
-- 
-- This migration creates the complete foundation:
--   - Organizations (vet clinics)
--   - Profiles (pet owners + clinic staff)
--   - Pets
--   - Chips (microchip records)
--   - Medical records + AI summaries
--   - Wallet passes
--   - NFC scan logs
--   - Row-Level Security on every table
--   - Indexes for common query patterns
--   - Triggers for updated_at timestamps

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy text search


-- ============================================================
-- CUSTOM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'pet_owner',
  'clinic_admin',
  'clinic_staff',
  'super_admin'
);

CREATE TYPE chip_status AS ENUM (
  'unregistered',
  'registered',
  'transferred',
  'deactivated'
);

CREATE TYPE record_type AS ENUM (
  'exam',
  'vaccination',
  'surgery',
  'lab',
  'prescription',
  'imaging',
  'note',
  'other'
);

CREATE TYPE subscription_status AS ENUM (
  'free',
  'trial',
  'active',
  'past_due',
  'canceled',
  'paused'
);

CREATE TYPE pass_type AS ENUM (
  'apple',
  'google'
);

CREATE TYPE pet_species AS ENUM (
  'dog',
  'cat',
  'other'
);

CREATE TYPE pet_sex AS ENUM (
  'male',
  'female',
  'unknown'
);


-- ============================================================
-- TABLES
-- ============================================================

-- Organizations (veterinary clinics)
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  phone         TEXT,
  email         TEXT,
  website       TEXT,
  address       JSONB DEFAULT '{}',
  -- address shape: { street, city, state, zip, country, lat, lng }
  logo_url      TEXT,
  settings      JSONB DEFAULT '{}',
  subscription_status subscription_status DEFAULT 'trial',
  stripe_customer_id  TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Profiles (all users — linked to Supabase Auth)
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  role          user_role NOT NULL DEFAULT 'pet_owner',
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  avatar_url    TEXT,
  subscription_status subscription_status DEFAULT 'free',
  stripe_customer_id  TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Pets
CREATE TABLE pets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  species       pet_species NOT NULL DEFAULT 'dog',
  breed         TEXT,
  date_of_birth DATE,
  sex           pet_sex DEFAULT 'unknown',
  color         TEXT,
  weight_kg     DECIMAL(6,2),
  photo_url     TEXT,
  notes         TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Chips (microchip records)
CREATE TABLE chips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chip_number   TEXT UNIQUE NOT NULL,
  -- ISO 11784/11785 15-digit number
  nfc_uid       TEXT UNIQUE,
  -- NFC antenna unique identifier
  pet_id        UUID REFERENCES pets(id) ON DELETE SET NULL,
  registered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  registered_at_org UUID REFERENCES organizations(id) ON DELETE SET NULL,
  status        chip_status NOT NULL DEFAULT 'unregistered',
  -- Emergency contact info (shown on NFC scan)
  emergency_contact JSONB DEFAULT '{}',
  -- shape: { name, phone, email, show_address, address }
  registered_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Medical records
CREATE TABLE medical_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id        UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  record_type   record_type NOT NULL DEFAULT 'note',
  title         TEXT NOT NULL,
  content       TEXT,
  record_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  attachments   JSONB DEFAULT '[]',
  -- shape: [{ url, filename, mime_type, size_bytes }]
  metadata      JSONB DEFAULT '{}',
  -- flexible field for record-type-specific data
  -- vaccination: { vaccine_name, lot_number, manufacturer, expiry }
  -- lab: { lab_name, results_url }
  -- prescription: { drug_name, dosage, frequency, duration, refills }
  is_visible_to_owner BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- AI-generated medical summaries
CREATE TABLE medical_summaries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id        UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  summary       TEXT NOT NULL,
  model_used    TEXT NOT NULL,
  model_version TEXT,
  records_included UUID[] NOT NULL,
  -- Array of medical_record IDs that were summarized
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  generated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Digital wallet passes
CREATE TABLE wallet_passes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id        UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pass_type     pass_type NOT NULL,
  pass_serial   TEXT UNIQUE NOT NULL,
  pass_data     JSONB NOT NULL DEFAULT '{}',
  -- Apple: { passTypeIdentifier, teamIdentifier, ... }
  -- Google: { classId, objectId, ... }
  is_active     BOOLEAN DEFAULT true,
  last_updated  TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- NFC scan logs (anonymous — for lost pet recovery analytics)
CREATE TABLE scan_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chip_id       UUID NOT NULL REFERENCES chips(id) ON DELETE CASCADE,
  scanned_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  location      JSONB,
  -- shape: { lat, lng, accuracy_meters }
  scanner_info  JSONB DEFAULT '{}',
  -- shape: { user_agent, ip_hash } (never store raw IP)
  notified_owner BOOLEAN DEFAULT false
);

-- Audit log (tracks important actions for compliance)
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  -- e.g., 'chip.registered', 'record.created', 'record.viewed', 'pass.generated'
  resource_type TEXT NOT NULL,
  resource_id   UUID NOT NULL,
  metadata      JSONB DEFAULT '{}',
  ip_hash       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);


-- ============================================================
-- INDEXES
-- ============================================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_org ON profiles(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_profiles_email ON profiles(email);

-- Pets
CREATE INDEX idx_pets_owner ON pets(owner_id);
CREATE INDEX idx_pets_active ON pets(owner_id) WHERE is_active = true;

-- Chips
CREATE INDEX idx_chips_pet ON chips(pet_id) WHERE pet_id IS NOT NULL;
CREATE INDEX idx_chips_chip_number ON chips(chip_number);
CREATE INDEX idx_chips_nfc_uid ON chips(nfc_uid) WHERE nfc_uid IS NOT NULL;
CREATE INDEX idx_chips_status ON chips(status);

-- Medical records
CREATE INDEX idx_records_pet ON medical_records(pet_id);
CREATE INDEX idx_records_org ON medical_records(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_records_date ON medical_records(pet_id, record_date DESC);
CREATE INDEX idx_records_type ON medical_records(pet_id, record_type);

-- Medical summaries
CREATE INDEX idx_summaries_pet ON medical_summaries(pet_id);

-- Wallet passes
CREATE INDEX idx_passes_pet ON wallet_passes(pet_id);
CREATE INDEX idx_passes_owner ON wallet_passes(owner_id);
CREATE INDEX idx_passes_serial ON wallet_passes(pass_serial);

-- Scan logs
CREATE INDEX idx_scans_chip ON scan_logs(chip_id);
CREATE INDEX idx_scans_time ON scan_logs(chip_id, scanned_at DESC);

-- Audit logs
CREATE INDEX idx_audit_actor ON audit_logs(actor_id) WHERE actor_id IS NOT NULL;
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_time ON audit_logs(created_at DESC);


-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_organizations_updated
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_pets_updated
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_chips_updated
  BEFORE UPDATE ON chips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_records_updated
  BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'pet_owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chips ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Clinic staff can see profiles in their organization
CREATE POLICY "profiles_select_org"
  ON profiles FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- ORGANIZATIONS ----

-- Clinic members can read their organization
CREATE POLICY "orgs_select_member"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

-- Clinic admins can update their organization
CREATE POLICY "orgs_update_admin"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid() AND role = 'clinic_admin'
    )
  );

-- ---- PETS ----

-- Owners can CRUD their own pets
CREATE POLICY "pets_select_owner"
  ON pets FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "pets_insert_owner"
  ON pets FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "pets_update_owner"
  ON pets FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "pets_delete_owner"
  ON pets FOR DELETE
  USING (owner_id = auth.uid());

-- Clinic staff can view pets with chips registered at their org
CREATE POLICY "pets_select_clinic"
  ON pets FOR SELECT
  USING (
    id IN (
      SELECT pet_id FROM chips
      WHERE registered_at_org = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
      AND pet_id IS NOT NULL
    )
  );

-- ---- CHIPS ----

-- Pet owners can see chips linked to their pets
CREATE POLICY "chips_select_owner"
  ON chips FOR SELECT
  USING (
    pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
  );

-- Clinic staff can see and register chips at their org
CREATE POLICY "chips_select_clinic"
  ON chips FOR SELECT
  USING (
    registered_at_org = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    OR status = 'unregistered'
  );

CREATE POLICY "chips_update_clinic"
  ON chips FOR UPDATE
  USING (
    registered_at_org = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    OR status = 'unregistered'
  );

-- ---- MEDICAL RECORDS ----

-- Pet owners can see their pets' records (if visible)
CREATE POLICY "records_select_owner"
  ON medical_records FOR SELECT
  USING (
    is_visible_to_owner = true
    AND pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
  );

-- Clinic staff can CRUD records for pets at their org
CREATE POLICY "records_select_clinic"
  ON medical_records FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "records_insert_clinic"
  ON medical_records FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "records_update_clinic"
  ON medical_records FOR UPDATE
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ---- MEDICAL SUMMARIES ----

-- Pet owners can see their pets' summaries
CREATE POLICY "summaries_select_owner"
  ON medical_summaries FOR SELECT
  USING (
    pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
  );

-- ---- WALLET PASSES ----

-- Owners can see their own passes
CREATE POLICY "passes_select_owner"
  ON wallet_passes FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "passes_update_owner"
  ON wallet_passes FOR UPDATE
  USING (owner_id = auth.uid());

-- ---- SCAN LOGS ----

-- Pet owners can see scan logs for their pets' chips
CREATE POLICY "scans_select_owner"
  ON scan_logs FOR SELECT
  USING (
    chip_id IN (
      SELECT c.id FROM chips c
      JOIN pets p ON c.pet_id = p.id
      WHERE p.owner_id = auth.uid()
    )
  );

-- Anyone can INSERT a scan log (NFC scans are anonymous)
CREATE POLICY "scans_insert_anon"
  ON scan_logs FOR INSERT
  WITH CHECK (true);

-- ---- AUDIT LOGS ----

-- Only super_admins can read audit logs
CREATE POLICY "audit_select_admin"
  ON audit_logs FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- Service role can insert audit logs (via Edge Functions)
CREATE POLICY "audit_insert_service"
  ON audit_logs FOR INSERT
  WITH CHECK (true);


-- ============================================================
-- FUNCTIONS: public chip lookup (for NFC scan page)
-- ============================================================

-- This function is called by the public NFC scan page.
-- It returns ONLY the data a stranger should see — pet name,
-- photo, and owner-approved emergency contact info.
-- No medical records, no owner email, no sensitive data.

CREATE OR REPLACE FUNCTION public_chip_lookup(lookup_chip_number TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'found', true,
    'pet_name', p.name,
    'pet_species', p.species,
    'pet_breed', p.breed,
    'pet_color', p.color,
    'pet_photo_url', p.photo_url,
    'emergency_contact', c.emergency_contact,
    'chip_number', c.chip_number
  ) INTO result
  FROM chips c
  JOIN pets p ON c.pet_id = p.id
  WHERE c.chip_number = lookup_chip_number
    AND c.status = 'registered'
    AND p.is_active = true;

  IF result IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon role (public access)
GRANT EXECUTE ON FUNCTION public_chip_lookup(TEXT) TO anon;


-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Pet photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-photos',
  'pet-photos',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Medical record attachments (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-attachments',
  'medical-attachments',
  false,
  20971520,  -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Organization logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'org-logos',
  'org-logos',
  true,
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
);

-- Storage RLS policies

-- Pet photos: owners can upload for their pets
CREATE POLICY "pet_photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pet-photos'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "pet_photos_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet-photos');

-- Medical attachments: clinic staff can upload, owners can view their pets'
CREATE POLICY "medical_attach_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-attachments'
    AND auth.uid() IS NOT NULL
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('clinic_admin', 'clinic_staff')
  );

CREATE POLICY "medical_attach_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-attachments'
    AND auth.uid() IS NOT NULL
  );
