// ============================================================
// Honeybee shared types
// These types mirror the database schema and are used by
// both the web dashboard and mobile app.
//
// When the schema changes, update these types AND run:
//   npm run db:generate-types
// to regenerate the Supabase auto-types for comparison.
// ============================================================

// ---- Enums ----

export type UserRole = 'pet_owner' | 'clinic_admin' | 'clinic_staff' | 'super_admin';

export type ChipStatus = 'unregistered' | 'registered' | 'transferred' | 'deactivated';

export type RecordType =
  | 'exam'
  | 'vaccination'
  | 'surgery'
  | 'lab'
  | 'prescription'
  | 'imaging'
  | 'note'
  | 'other';

export type SubscriptionStatus =
  | 'free'
  | 'trial'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'paused';

export type PassType = 'apple' | 'google';

export type PetSpecies = 'dog' | 'cat' | 'other';

export type PetSex = 'male' | 'female' | 'unknown';


// ---- Core entities ----

export interface Organization {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: Address;
  logo_url: string | null;
  settings: OrganizationSettings;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  organization_id: string | null;
  avatar_url: string | null;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  date_of_birth: string | null;
  sex: PetSex;
  color: string | null;
  weight_kg: number | null;
  photo_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chip {
  id: string;
  chip_number: string;
  nfc_uid: string | null;
  pet_id: string | null;
  registered_by: string | null;
  registered_at_org: string | null;
  status: ChipStatus;
  emergency_contact: EmergencyContact;
  registered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  pet_id: string;
  organization_id: string | null;
  created_by: string | null;
  record_type: RecordType;
  title: string;
  content: string | null;
  record_date: string;
  attachments: Attachment[];
  metadata: RecordMetadata;
  is_visible_to_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalSummary {
  id: string;
  pet_id: string;
  summary: string;
  model_used: string;
  model_version: string | null;
  records_included: string[];
  prompt_tokens: number | null;
  completion_tokens: number | null;
  generated_at: string;
}

export interface WalletPass {
  id: string;
  pet_id: string;
  owner_id: string;
  pass_type: PassType;
  pass_serial: string;
  pass_data: Record<string, unknown>;
  is_active: boolean;
  last_updated: string;
  created_at: string;
}

export interface ScanLog {
  id: string;
  chip_id: string;
  scanned_at: string;
  location: GeoLocation | null;
  scanner_info: ScannerInfo;
  notified_owner: boolean;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, unknown>;
  ip_hash: string | null;
  created_at: string;
}


// ---- JSONB sub-types ----

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

export interface OrganizationSettings {
  timezone?: string;
  default_record_visibility?: boolean;
  branding_color?: string;
}

export interface EmergencyContact {
  name?: string;
  phone?: string;
  email?: string;
  show_address?: boolean;
  address?: string;
}

export interface Attachment {
  url: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy_meters?: number;
}

export interface ScannerInfo {
  user_agent?: string;
  ip_hash?: string;
}

// Record-type-specific metadata shapes

export interface VaccinationMetadata {
  vaccine_name: string;
  lot_number?: string;
  manufacturer?: string;
  expiry?: string;
}

export interface LabMetadata {
  lab_name?: string;
  results_url?: string;
}

export interface PrescriptionMetadata {
  drug_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  refills?: number;
}

export type RecordMetadata =
  | VaccinationMetadata
  | LabMetadata
  | PrescriptionMetadata
  | Record<string, unknown>;


// ---- API response shapes ----

export interface PublicChipLookup {
  found: boolean;
  pet_name?: string;
  pet_species?: PetSpecies;
  pet_breed?: string;
  pet_color?: string;
  pet_photo_url?: string;
  emergency_contact?: EmergencyContact;
  chip_number?: string;
}

// ---- Form input types (for create/update operations) ----

export interface CreatePetInput {
  name: string;
  species: PetSpecies;
  breed?: string;
  date_of_birth?: string;
  sex?: PetSex;
  color?: string;
  weight_kg?: number;
  notes?: string;
}

export interface UpdatePetInput extends Partial<CreatePetInput> {
  is_active?: boolean;
}

export interface RegisterChipInput {
  chip_number: string;
  nfc_uid?: string;
  pet_id: string;
  emergency_contact: EmergencyContact;
}

export interface CreateMedicalRecordInput {
  pet_id: string;
  record_type: RecordType;
  title: string;
  content?: string;
  record_date?: string;
  metadata?: RecordMetadata;
  is_visible_to_owner?: boolean;
}
