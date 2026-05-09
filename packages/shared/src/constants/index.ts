// ============================================================
// Application constants
// Single source of truth — import from @honeybee/shared
// ============================================================

// ---- Subscription plans ----

export const PLANS = {
  PET_OWNER: {
    FREE: {
      id: 'free',
      name: 'Free',
      price_monthly: 0,
      features: ['Basic pet profile', 'Chip registration', 'NFC lost pet recovery'],
    },
    PREMIUM: {
      id: 'premium',
      name: 'Premium',
      price_monthly: 9.99,
      stripe_price_id: '', // Set after creating in Stripe
      features: [
        'Everything in Free',
        'Cloud medical records',
        'AI health summaries',
        'Digital wallet pass',
        'Scan location alerts',
      ],
    },
  },
  CLINIC: {
    STARTER: {
      id: 'clinic_starter',
      name: 'Clinic Starter',
      price_monthly: 49,
      stripe_price_id: '',
      max_staff: 3,
      features: ['Cloud records platform', 'Up to 3 staff accounts', 'Basic reporting'],
    },
    PROFESSIONAL: {
      id: 'clinic_pro',
      name: 'Clinic Professional',
      price_monthly: 149,
      stripe_price_id: '',
      max_staff: 15,
      features: [
        'Everything in Starter',
        'Up to 15 staff accounts',
        'AI record summarization',
        'Advanced reporting',
        'Priority support',
      ],
    },
  },
} as const;


// ---- Chip configuration ----

export const CHIP = {
  // ISO 11784/11785 chip number format
  NUMBER_LENGTH: 15,
  NUMBER_REGEX: /^\d{15}$/,
  // NFC UID format (hex string, typically 7 or 10 bytes)
  NFC_UID_REGEX: /^[0-9A-Fa-f]{14,20}$/,
} as const;


// ---- File upload limits ----

export const UPLOAD = {
  PET_PHOTO_MAX_SIZE: 5 * 1024 * 1024,       // 5MB
  MEDICAL_ATTACHMENT_MAX_SIZE: 20 * 1024 * 1024, // 20MB
  ORG_LOGO_MAX_SIZE: 2 * 1024 * 1024,         // 2MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_ATTACHMENT_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
} as const;


// ---- Validation ----

export const VALIDATION = {
  PET_NAME_MAX_LENGTH: 100,
  RECORD_TITLE_MAX_LENGTH: 200,
  RECORD_CONTENT_MAX_LENGTH: 50000,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,  // E.164 format
  PASSWORD_MIN_LENGTH: 8,
} as const;


// ---- AI service ----

export const AI = {
  DEFAULT_MODEL: 'claude-sonnet-4-20250514',
  MAX_RECORDS_PER_SUMMARY: 50,
  SUMMARY_MAX_TOKENS: 2000,
} as const;


// ---- Feature flags ----
// Simple boolean flags. Swap to a proper feature flag service
// (LaunchDarkly, Statsig) when you have paying customers.

export const FEATURES = {
  WALLET_PASS_ENABLED: true,
  AI_SUMMARIES_ENABLED: true,
  SCAN_LOCATION_TRACKING: true,
  CLINIC_ONBOARDING: false,  // Enable when clinic flow is ready
} as const;
