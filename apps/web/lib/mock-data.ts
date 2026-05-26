// Demo data — used for investor screenshots
// Replace with real Supabase queries when auth is wired up

export const mockPet = {
  id: 'pet_demo_001',
  name: 'Biscuit',
  species: 'dog',
  breed: 'Golden Retriever',
  date_of_birth: '2020-03-14',
  sex: 'male',
  color: 'Golden',
  weight_kg: 32.5,
  photo_url: null,
  chip_number: '985141002345678',
  chip_status: 'registered',
  nfc_uid: 'A3F84C2D19E0',
  last_scanned: '2026-05-08T14:32:00Z',
  scan_location: 'Vineyard, UT',
  owner_name: 'Ian & Angela Schwarz',
  emergency_phone: '(801) 555-0192',
  vet_clinic: 'Vineyard Animal Hospital',
}

export const mockMedicalRecords = [
  {
    id: 'rec_001',
    record_type: 'vaccination',
    title: 'Annual Vaccines — DHPP + Rabies',
    content: 'Patient presented for annual wellness. DHPP booster and 3-year rabies administered. No adverse reactions observed. Weight stable.',
    record_date: '2026-04-22',
    created_by: 'Dr. Angela Schwarz, DVM',
    clinic: 'Vineyard Animal Hospital',
    metadata: { vaccine_name: 'DHPP + Rabies 3yr', lot_number: 'LT-2024-8821' },
    is_visible_to_owner: true,
  },
  {
    id: 'rec_002',
    record_type: 'exam',
    title: 'Wellness Exam — Annual',
    content: 'Full physical exam performed. Heart and lung sounds normal. Dental health: mild tartar on molars, recommend dental cleaning. Hips: no signs of dysplasia. BCS 5/9.',
    record_date: '2026-04-22',
    created_by: 'Dr. Angela Schwarz, DVM',
    clinic: 'Vineyard Animal Hospital',
    metadata: {},
    is_visible_to_owner: true,
  },
  {
    id: 'rec_003',
    record_type: 'prescription',
    title: 'Heartgard Plus — 12 Month Supply',
    content: 'Monthly heartworm prevention. Brown chewable tablet, 51-100 lbs.',
    record_date: '2026-04-22',
    created_by: 'Dr. Angela Schwarz, DVM',
    clinic: 'Vineyard Animal Hospital',
    metadata: { drug_name: 'Heartgard Plus', dosage: '51-100 lbs', frequency: 'Monthly' },
    is_visible_to_owner: true,
  },
  {
    id: 'rec_004',
    record_type: 'lab',
    title: 'Annual Blood Panel + Heartworm Test',
    content: 'CBC, chemistry, T4 all within normal reference ranges. Heartworm antigen negative. Fecal float negative.',
    record_date: '2026-04-22',
    created_by: 'Dr. Angela Schwarz, DVM',
    clinic: 'Vineyard Animal Hospital',
    metadata: { lab_name: 'IDEXX Laboratories' },
    is_visible_to_owner: true,
  },
]

export const mockAiSummary = `Biscuit is a 6-year-old male Golden Retriever in excellent overall health. His most recent wellness exam (April 2026) confirmed normal heart and lung function, healthy body condition, and no joint concerns — great news for a large breed at this age.

His vaccinations are current through April 2029 (DHPP + Rabies). He's on monthly Heartgard Plus for heartworm prevention, and his last heartworm test came back negative.

One thing to keep an eye on: mild tartar buildup was noted on his back molars. A professional dental cleaning is recommended within the next 6–12 months to prevent gum disease.

Next scheduled visit: April 2027 annual wellness.`

export const mockScanLogs = [
  { scanned_at: '2026-05-08T14:32:00Z', location: 'Vineyard, UT', notified: false },
  { scanned_at: '2026-04-22T09:15:00Z', location: 'Vineyard Animal Hospital', notified: false },
  { scanned_at: '2026-01-03T17:44:00Z', location: 'Orem, UT', notified: true },
]

// Clinic data
export const mockClinic = {
  name: 'Vineyard Animal Hospital',
  address: '150 W Center St, Vineyard, UT 84059',
  staff_name: 'Dr. Angela Schwarz, DVM',
  avatar: 'AS',
}

export const mockPatients = [
  {
    id: 'pet_001',
    name: 'Biscuit',
    species: 'dog',
    breed: 'Golden Retriever',
    owner: 'Ian Schwarz',
    chip_status: 'registered',
    chip_number: '985141002345678',
    last_visit: '2026-04-22',
    next_due: 'Apr 2027',
    weight: '32.5 kg',
    age: '6 yrs',
    color: '#F5A623',
    initials: 'BI',
  },
  {
    id: 'pet_002',
    name: 'Luna',
    species: 'cat',
    breed: 'Domestic Shorthair',
    owner: 'Sarah Chen',
    chip_status: 'registered',
    chip_number: '985141009871234',
    last_visit: '2026-05-01',
    next_due: 'May 2027',
    weight: '4.2 kg',
    age: '3 yrs',
    color: '#6366F1',
    initials: 'LU',
  },
  {
    id: 'pet_003',
    name: 'Milo',
    species: 'dog',
    breed: 'Labrador Mix',
    owner: 'James Park',
    chip_status: 'registered',
    chip_number: '985141001122334',
    last_visit: '2026-04-30',
    next_due: 'Apr 2027',
    weight: '28.1 kg',
    age: '4 yrs',
    color: '#10B981',
    initials: 'MI',
  },
  {
    id: 'pet_004',
    name: 'Coco',
    species: 'dog',
    breed: 'French Bulldog',
    owner: 'Maria Lopez',
    chip_status: 'unregistered',
    chip_number: null,
    last_visit: '2026-05-07',
    next_due: 'Nov 2026',
    weight: '11.8 kg',
    age: '2 yrs',
    color: '#8B5CF6',
    initials: 'CO',
  },
  {
    id: 'pet_005',
    name: 'Oliver',
    species: 'cat',
    breed: 'Maine Coon',
    owner: 'David Kim',
    chip_status: 'registered',
    chip_number: '985141005566778',
    last_visit: '2026-03-18',
    next_due: 'Mar 2027',
    weight: '7.6 kg',
    age: '5 yrs',
    color: '#F59E0B',
    initials: 'OL',
  },
  {
    id: 'pet_006',
    name: 'Bella',
    species: 'dog',
    breed: 'Beagle',
    owner: 'Emma Wilson',
    chip_status: 'registered',
    chip_number: '985141003344556',
    last_visit: '2026-05-05',
    next_due: 'May 2027',
    weight: '12.3 kg',
    age: '7 yrs',
    color: '#EF4444',
    initials: 'BE',
  },
]

export const mockClinicStats = {
  patients_today: 8,
  total_patients: 247,
  chips_this_month: 14,
  records_today: 23,
}

export const mockRecentActivity = [
  { time: '2:34 PM', action: 'Medical record added', detail: 'Wellness exam — Bella (Wilson)', type: 'record' },
  { time: '1:58 PM', action: 'Chip registered', detail: 'Chip #985141003344556 → Bella', type: 'chip' },
  { time: '1:12 PM', action: 'Medical record added', detail: 'Vaccination — Milo (Park)', type: 'record' },
  { time: '11:45 AM', action: 'AI summary generated', detail: 'Luna — 12 records summarized', type: 'ai' },
  { time: '10:20 AM', action: 'Chip registered', detail: 'Chip #985141009871234 → Luna', type: 'chip' },
  { time: '9:05 AM', action: 'Medical record added', detail: 'Lab results — Oliver (Kim)', type: 'record' },
]
