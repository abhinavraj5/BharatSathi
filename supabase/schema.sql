-- Users (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user','expert','admin')),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experts
CREATE TABLE experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('doctor','education','government','agriculture')),
  specialization TEXT,
  bio TEXT,
  languages TEXT[],
  is_available BOOLEAN DEFAULT TRUE,
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call requests
CREATE TABLE call_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  expert_id UUID REFERENCES users(id),
  category TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat logs
CREATE TABLE chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  message TEXT,
  reply TEXT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Government schemes
CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  eligibility TEXT,
  documents TEXT,
  how_to_apply TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crop reports
CREATE TABLE crop_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  image_path TEXT,
  analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample schemes
INSERT INTO schemes (title, description, eligibility, documents, how_to_apply, category) VALUES
('PM-KISAN', 'Rs 6000/year income support', 'Small & marginal farmers', 'Aadhaar, land records, bank account', 'Apply at pmkisan.gov.in or CSC', 'agriculture'),
('Kisan Credit Card', 'Low-interest agri loans', 'All farmers', 'Aadhaar, land records', 'Visit nearest bank', 'agriculture'),
('Ayushman Bharat', 'Rs 5 lakh health cover', 'SECC beneficiaries', 'Aadhaar, ration card', 'Visit empanelled hospital', 'health'),
('PM Awas Yojana', 'Housing subsidy', 'Rural BPL families', 'Aadhaar, income proof', 'Apply through Gram Panchayat', 'housing');

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone read users" ON users FOR SELECT USING (true);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone read experts" ON experts FOR SELECT USING (true);
CREATE POLICY "Experts manage own" ON experts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User see own calls" ON call_requests FOR SELECT USING (auth.uid() = user_id OR auth.uid() = expert_id);
CREATE POLICY "User create calls" ON call_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User update calls" ON call_requests FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = expert_id);
CREATE POLICY "User see own chats" ON chat_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public schemes" ON schemes FOR SELECT USING (true);
CREATE POLICY "User see own crops" ON crop_reports FOR ALL USING (auth.uid() = user_id);

-- Storage bucket (run in Supabase dashboard or SQL)
INSERT INTO storage.buckets (id, name, public) VALUES ('crop-images', 'crop-images', true) ON CONFLICT DO NOTHING;