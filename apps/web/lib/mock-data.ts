export const mockPet = {
  name: 'Biscuit',
  species: 'dog',
  breed: 'Golden Retriever',
  date_of_birth: '2020-03-14',
  sex: 'Male',
  color: 'Golden',
  weight_kg: 32.5,
  chip_number: '985141002345678',
  chip_status: 'registered',
  nfc_uid: 'A3F84C2D19E0',
  last_scanned: '2026-05-08T14:32:00Z',
  scan_location: 'Vineyard, UT',
  owner_name: 'John & Lisa Smith',
  owner_phone: '(801) 555-0192',
  owner_email: 'john.smith@email.com',
  vet_clinic: 'Summit Animal Hospital',
}

export const mockRecords = [
  { id: 'r1', type: 'vaccination', title: 'Annual Vaccines — DHPP + Rabies', date: '2026-04-22', author: 'Dr. Sarah Chen, DVM', content: 'DHPP booster and 3-year rabies administered. No adverse reactions. Weight stable at 32.5 kg.', meta: { vaccine: 'DHPP + Rabies 3yr', lot: 'LT-2024-8821' } },
  { id: 'r2', type: 'exam', title: 'Annual Wellness Exam', date: '2026-04-22', author: 'Dr. Sarah Chen, DVM', content: 'Full physical. Heart and lungs normal. Mild tartar on molars — dental cleaning recommended. Hips clear. BCS 5/9.', meta: {} },
  { id: 'r3', type: 'prescription', title: 'Heartgard Plus — 12 Month Supply', date: '2026-04-22', author: 'Dr. Sarah Chen, DVM', content: 'Monthly heartworm prevention. Brown chewable, 51–100 lbs.', meta: { drug: 'Heartgard Plus', dosage: '51–100 lbs', freq: 'Monthly' } },
  { id: 'r4', type: 'lab', title: 'Annual Blood Panel + Heartworm Test', date: '2026-04-22', author: 'Dr. Sarah Chen, DVM', content: 'CBC, chemistry, T4 all within normal ranges. Heartworm antigen negative. Fecal float negative.', meta: { lab: 'IDEXX Laboratories' } },
]

export const mockSummary = `Biscuit is a healthy 6-year-old Golden Retriever with no significant concerns. His April 2026 wellness exam confirmed normal cardiac and pulmonary function, stable weight, and clear hips.

Vaccinations are current through April 2029. He's on monthly Heartgard Plus — last heartworm test negative.

One item to monitor: mild tartar buildup on his back molars. A professional dental cleaning is recommended in the next 6–12 months.

Next scheduled visit: April 2027 annual wellness.`

export const mockScans = [
  { at: '2026-05-08T14:32:00Z', location: 'Vineyard, UT', alerted: false },
  { at: '2026-04-22T09:15:00Z', location: 'Summit Animal Hospital', alerted: false },
  { at: '2026-01-03T17:44:00Z', location: 'Orem, UT', alerted: true },
]

export const mockClinic = {
  name: 'Summit Animal Hospital',
  address: '150 W Center St, Vineyard, UT 84059',
  doctor: 'Dr. Sarah Chen, DVM',
  initials: 'SC',
}

export const mockPatients = [
  { id: 'p1', name: 'Biscuit', breed: 'Golden Retriever', species: 'dog', owner: 'John Smith', chip: '985141002345678', chipped: true, lastVisit: '2026-04-22', nextDue: 'Apr 2027', weight: '32.5 kg', age: '6 yrs', hue: '#F5A623' },
  { id: 'p2', name: 'Luna', breed: 'Domestic Shorthair', species: 'cat', owner: 'Sarah Chen', chip: '985141009871234', chipped: true, lastVisit: '2026-05-01', nextDue: 'May 2027', weight: '4.2 kg', age: '3 yrs', hue: '#6366F1' },
  { id: 'p3', name: 'Milo', breed: 'Labrador Mix', species: 'dog', owner: 'James Park', chip: '985141001122334', chipped: true, lastVisit: '2026-04-30', nextDue: 'Apr 2027', weight: '28.1 kg', age: '4 yrs', hue: '#34C759' },
  { id: 'p4', name: 'Coco', breed: 'French Bulldog', species: 'dog', owner: 'Maria Lopez', chip: null, chipped: false, lastVisit: '2026-05-07', nextDue: 'Nov 2026', weight: '11.8 kg', age: '2 yrs', hue: '#AF52DE' },
  { id: 'p5', name: 'Oliver', breed: 'Maine Coon', species: 'cat', owner: 'David Kim', chip: '985141005566778', chipped: true, lastVisit: '2026-03-18', nextDue: 'Mar 2027', weight: '7.6 kg', age: '5 yrs', hue: '#FF9F0A' },
  { id: 'p6', name: 'Bella', breed: 'Beagle', species: 'dog', owner: 'Emma Wilson', chip: '985141003344556', chipped: true, lastVisit: '2026-05-05', nextDue: 'May 2027', weight: '12.3 kg', age: '7 yrs', hue: '#FF3B30' },
]

export const mockStats = { today: 8, total: 247, chipsMonth: 14, recordsToday: 23 }

export const mockActivity = [
  { time: '2:34 PM', text: 'Wellness exam added', detail: 'Bella — Emma Wilson', type: 'record' },
  { time: '1:58 PM', text: 'Chip registered', detail: '#985141003344556 → Bella', type: 'chip' },
  { time: '1:12 PM', text: 'Lab results added', detail: 'Milo — James Park', type: 'record' },
  { time: '11:45 AM', text: 'AI summary generated', detail: 'Luna — 12 records', type: 'ai' },
  { time: '10:20 AM', text: 'Chip registered', detail: '#985141009871234 → Luna', type: 'chip' },
  { time: '9:05 AM', text: 'Prescription added', detail: 'Oliver — David Kim', type: 'record' },
]
