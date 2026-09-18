-- ==========================================================================
-- MAGIC SCISSORS - SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==========================================================================

-- 1. Create Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    service_id TEXT,
    service_name TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Lead & Conversion Events Tracking Table
CREATE TABLE IF NOT EXISTS public.lead_events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL, -- whatsapp_click, dialpad_call, new_appointment_booked, page_visit
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    url TEXT,
    user_agent TEXT
);

-- 3. Create Client Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    vip_tier TEXT DEFAULT 'Gold VIP Member',
    loyalty_points INTEGER DEFAULT 250,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) & Public Policies for Demo/Client usage
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for website booking form
CREATE POLICY "Allow anonymous appointment creation" ON public.appointments
    FOR INSERT WITH CHECK (true);

-- Allow reading appointments for concierge desk
CREATE POLICY "Allow reading appointments" ON public.appointments
    FOR SELECT USING (true);

-- Allow updating appointment statuses
CREATE POLICY "Allow status updates" ON public.appointments
    FOR UPDATE USING (true);

-- Allow logging lead clicks
CREATE POLICY "Allow anonymous lead logging" ON public.lead_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow reading lead events" ON public.lead_events
    FOR SELECT USING (true);

-- Enable Realtime for appointments
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
