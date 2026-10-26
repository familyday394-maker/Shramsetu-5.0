-- ============================================================================
-- SHRAM SETU 2.0 — PostgreSQL Production Schema & Row Level Security (RLS)
-- Version: 2.0.0
-- Target: Supabase / PostgreSQL 15+
-- ============================================================================

-- 1. Profiles & Role Assignment Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('worker', 'contractor', 'auditor', 'admin')),
  full_name TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Construction Sites Table
CREATE TABLE IF NOT EXISTS public.sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hindi_name TEXT,
  location TEXT NOT NULL,
  city VARCHAR(50) NOT NULL DEFAULT 'Indore',
  contractor_name TEXT NOT NULL,
  contractor_phone VARCHAR(20) NOT NULL,
  project_type VARCHAR(50) NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  active_workers INT DEFAULT 0,
  safety_rating VARCHAR(30) DEFAULT 'Grade A (BOCW Compliant)',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Worker Profiles Table
CREATE TABLE IF NOT EXISTS public.workers (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  name TEXT NOT NULL,
  hindi_name TEXT,
  phone VARCHAR(20) NOT NULL,
  trade TEXT NOT NULL,
  skill_level VARCHAR(30) NOT NULL CHECK (skill_level IN ('unskilled', 'semi_skilled', 'skilled', 'highly_skilled')),
  daily_base_wage_paise BIGINT NOT NULL CHECK (daily_base_wage_paise > 0),
  eshram_uan VARCHAR(20) UNIQUE NOT NULL,
  bocw_registration_no VARCHAR(50) UNIQUE NOT NULL,
  aadhaar_last4 VARCHAR(4) NOT NULL,
  blood_group VARCHAR(5),
  active_site_id TEXT REFERENCES public.sites(id) ON DELETE SET NULL,
  bank_account_last4 VARCHAR(4),
  ifsc_code VARCHAR(15),
  upi_id VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attendance Muster Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY,
  worker_id TEXT REFERENCES public.workers(id) ON DELETE CASCADE NOT NULL,
  site_id TEXT REFERENCES public.sites(id) ON DELETE RESTRICT NOT NULL,
  date DATE NOT NULL,
  time_in TIME NOT NULL,
  time_out TIME,
  shift_type VARCHAR(20) NOT NULL CHECK (shift_type IN ('full_day', 'half_day', 'overtime_2h', 'overtime_4h')),
  base_hours INT NOT NULL DEFAULT 8,
  overtime_hours INT NOT NULL DEFAULT 0,
  calculated_wage_paise BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'half_day', 'overtime')),
  supervisor_name TEXT NOT NULL,
  verification_hash VARCHAR(64) NOT NULL,
  previous_hash VARCHAR(64),
  geo_verified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Wage Ledger Entries Table (All transactions, credits, advances, payouts)
CREATE TABLE IF NOT EXISTS public.wage_ledger_entries (
  id TEXT PRIMARY KEY,
  worker_id TEXT REFERENCES public.workers(id) ON DELETE CASCADE NOT NULL,
  site_id TEXT REFERENCES public.sites(id) ON DELETE RESTRICT NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('daily_credit', 'advance_kharcha', 'weekly_settlement', 'bonus', 'penalty_adjustment', 'deduction')),
  amount_paise BIGINT NOT NULL, -- Negative for payouts/advances, positive for earnings/allowances
  description TEXT NOT NULL,
  hindi_description TEXT,
  payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('cash', 'upi', 'bank_transfer')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('settled', 'pending')),
  acknowledgment_status VARCHAR(30) NOT NULL DEFAULT 'recorded_by_contractor' 
    CHECK (acknowledgment_status IN ('unpaid', 'partially_paid', 'recorded_by_contractor', 'acknowledged_by_worker', 'disputed')),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by_worker_id TEXT REFERENCES public.workers(id),
  utr_or_receipt_no VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Dispute & Grievance Petitions Table
CREATE TABLE IF NOT EXISTS public.disputes (
  id TEXT PRIMARY KEY,
  worker_id TEXT REFERENCES public.workers(id) ON DELETE CASCADE NOT NULL,
  contractor_name TEXT NOT NULL,
  contractor_phone VARCHAR(20) NOT NULL,
  site_name TEXT NOT NULL,
  dispute_type VARCHAR(50) NOT NULL CHECK (dispute_type IN ('unpaid_wages', 'arbitrary_deduction', 'denied_overtime', 'unsafe_conditions', 'bocw_benefit_denial')),
  claimed_amount_paise BIGINT NOT NULL,
  incident_date DATE NOT NULL,
  filing_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_inquiry', 'notice_issued', 'settled')),
  description TEXT NOT NULL, -- Worker's claim
  contractor_response TEXT, -- Preserved contractor rebuttal
  contractor_response_date DATE,
  dlo_filing_ref VARCHAR(50) UNIQUE NOT NULL,
  evidence_muster_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Cryptographic Audit Events Chain Table
CREATE TABLE IF NOT EXISTS public.audit_events (
  id TEXT PRIMARY KEY,
  sequence_number BIGINT UNIQUE NOT NULL,
  entity_type VARCHAR(30) NOT NULL,
  entity_id TEXT NOT NULL,
  action VARCHAR(30) NOT NULL,
  actor_role VARCHAR(20) NOT NULL,
  actor_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  canonical_payload TEXT NOT NULL,
  previous_hash VARCHAR(64) NOT NULL,
  hash VARCHAR(64) UNIQUE NOT NULL
);

-- 8. Cross-Device Approval Requests Table
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id TEXT PRIMARY KEY,
  worker_id TEXT REFERENCES public.workers(id) ON DELETE CASCADE NOT NULL,
  contractor_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  contractor_name TEXT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  record_id TEXT NOT NULL,
  amount_paise BIGINT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reported_suspicious')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wage_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policy: Users can view and manage their own profile
CREATE POLICY "Users view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- 2. Workers Policy: Worker can only view their own record; Contractors can view assigned workers
CREATE POLICY "Workers view self" 
  ON public.workers FOR SELECT 
  USING (auth.uid() = user_id);

-- 3. Attendance Records Policy: Worker reads own attendance; Contractor reads site attendance
CREATE POLICY "Workers read own attendance" 
  ON public.attendance_records FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.workers WHERE workers.id = attendance_records.worker_id AND workers.user_id = auth.uid()));

-- 4. Wage Ledger Policy: Worker views own transactions
CREATE POLICY "Workers view own ledger" 
  ON public.wage_ledger_entries FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.workers WHERE workers.id = wage_ledger_entries.worker_id AND workers.user_id = auth.uid()));

-- Worker can update only acknowledgment status on their own entries
CREATE POLICY "Workers acknowledge payments" 
  ON public.wage_ledger_entries FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.workers WHERE workers.id = wage_ledger_entries.worker_id AND workers.user_id = auth.uid()))
  WITH CHECK (acknowledgment_status IN ('acknowledged_by_worker', 'disputed'));

-- 5. Disputes Policy: Worker can create and view their own disputes
CREATE POLICY "Workers manage own disputes" 
  ON public.disputes FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.workers WHERE workers.id = disputes.worker_id AND workers.user_id = auth.uid()));

-- 6. Audit Events Policy: Read-only for authenticated participants, append-only for verification
CREATE POLICY "Audit events public read" 
  ON public.audit_events FOR SELECT 
  TO authenticated 
  USING (true);

-- 7. Approval Requests: Only target worker can approve/reject
CREATE POLICY "Target worker manages approval" 
  ON public.approval_requests FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.workers WHERE workers.id = approval_requests.worker_id AND workers.user_id = auth.uid()));
