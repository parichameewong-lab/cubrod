-- ==============================================================================
-- CLUBROD Database Schema for Supabase (Prefix: clubrod_*)
-- ปลอดภัย 100% สามารถรันใน Supabase เดียวกับ kaitong ได้โดยไม่ชนกับตารางเดิม
-- ==============================================================================

-- 1. Enable UUID Extension (ถ้ายังไม่มี)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Master Car Features (ออฟชั่นและคุณสมบัติรถยนต์ส่วนกลาง)
CREATE TABLE IF NOT EXISTS public.clubrod_car_features (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'comfort',
    icon TEXT DEFAULT '✓',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Advertisers (เต็นท์รถ / ผู้ลงประกาศ)
CREATE TABLE IF NOT EXISTS public.clubrod_advertisers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    store_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    line TEXT,
    province TEXT NOT NULL,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    storefront_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Agents (นายหน้า Affiliate)
CREATE TABLE IF NOT EXISTS public.clubrod_agents (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    line TEXT,
    province TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    payout_type TEXT DEFAULT 'promptpay',
    payout_account TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Cars (รายการรถยนต์)
CREATE TABLE IF NOT EXISTS public.clubrod_cars (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    advertiser_id TEXT REFERENCES public.clubrod_advertisers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    submodel TEXT,
    year INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    down_payment NUMERIC DEFAULT 0,
    monthly_payment NUMERIC DEFAULT 0,
    mileage INTEGER DEFAULT 0,
    gear TEXT DEFAULT 'อัตโนมัติ',
    fuel TEXT DEFAULT 'เบนซิน',
    color TEXT,
    license_plate TEXT,
    province TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'sold')),
    is_clubrod_choice BOOLEAN DEFAULT FALSE,
    commission_total NUMERIC DEFAULT 0,
    commission_agent NUMERIC DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    inspection_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Leads (ข้อมูลลูกค้าและสถานะการขาย)
CREATE TABLE IF NOT EXISTS public.clubrod_leads (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    car_id TEXT REFERENCES public.clubrod_cars(id) ON DELETE SET NULL,
    agent_code TEXT NOT NULL DEFAULT 'PLATFORM',
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    line TEXT,
    contact_time TEXT DEFAULT '13:00–16:00 น.',
    lead_status TEXT NOT NULL DEFAULT 'ใหม่' CHECK (lead_status IN ('ใหม่', 'กำลังติดตาม', 'นัดดูรถ', 'ไม่สำเร็จ')),
    sale_status TEXT NOT NULL DEFAULT 'สนใจรถ' CHECK (sale_status IN ('สนใจรถ', 'จอง', 'ไฟแนนซ์', 'ส่งมอบสำเร็จ', 'ยกเลิก', 'ไฟแนนซ์ไม่ผ่าน', 'รถขายแล้ว')),
    payout_status TEXT NOT NULL DEFAULT 'ยังไม่เกิดสิทธิ์' CHECK (payout_status IN ('ยังไม่เกิดสิทธิ์', 'รอตรวจสอบ', 'โอนเงินสำเร็จแล้ว')),
    commission_amount NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Chat Conversations (ระบบแชตสด)
CREATE TABLE IF NOT EXISTS public.clubrod_chats (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    car_id TEXT,
    agent_code TEXT DEFAULT 'PLATFORM',
    customer_name TEXT,
    customer_phone TEXT,
    car_title TEXT,
    last_message TEXT,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- เปิดให้ Client ผ่าน Anon Key อ่านและเขียนข้อมูลได้ตามสิทธิ์
-- ==============================================================================

ALTER TABLE public.clubrod_car_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubrod_advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubrod_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubrod_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubrod_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubrod_chats ENABLE ROW LEVEL SECURITY;

-- Anonymous / Authenticated Read & Write Policies
DROP POLICY IF EXISTS "Allow public read on features" ON public.clubrod_car_features;
CREATE POLICY "Allow public read on features" ON public.clubrod_car_features FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on advertisers" ON public.clubrod_advertisers;
CREATE POLICY "Allow public read on advertisers" ON public.clubrod_advertisers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on agents" ON public.clubrod_agents;
CREATE POLICY "Allow public read on agents" ON public.clubrod_agents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on cars" ON public.clubrod_cars;
CREATE POLICY "Allow public read on cars" ON public.clubrod_cars FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on leads" ON public.clubrod_leads;
CREATE POLICY "Allow public read/write on leads" ON public.clubrod_leads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on chats" ON public.clubrod_chats;
CREATE POLICY "Allow public read/write on chats" ON public.clubrod_chats FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- Initial Seed Data (ตัวเลือกออฟชั่นเริ่มต้น)
-- ==============================================================================
INSERT INTO public.clubrod_car_features (name, category, icon)
VALUES
  ('เบาะหนังปรับไฟฟ้า', 'comfort', '💺'),
  ('ระบบดันหลังไฟฟ้า (Lumbar Support)', 'comfort', '💺'),
  ('ระบบปรับอากาศอัตโนมัติแยกซ้าย-ขวา', 'comfort', '❄️'),
  ('ช่องแอร์สำหรับผู้โดยสารตอนหลัง', 'comfort', '❄️'),
  ('กุญแจ Smart Keyless Entry', 'comfort', '🔑'),
  ('ปุ่มสตาร์ทเครื่องยนต์ Push Start', 'comfort', '🔘'),
  ('กระจกมองข้างพับ/ปรับไฟฟ้าพร้อมไฟเลี้ยว', 'comfort', '🪟'),
  ('พวงมาลัยมัลติฟังก์ชันหุ้มหนัง', 'comfort', '🏎️'),
  ('หลังคาซันรูฟ / พานอรามิคซันรูฟ', 'comfort', '☀️'),
  ('หน้าจอเครื่องเสียงระบบสัมผัส', 'entertainment', '📺'),
  ('รองรับ Apple CarPlay / Android Auto', 'entertainment', '📱'),
  ('ระบบนำทาง Navigation System', 'entertainment', '🗺️'),
  ('ลำโพงรอบทิศทางระดับพรีเมียม', 'entertainment', '📻'),
  ('แท่นชาร์จโทรศัพท์ไร้สาย (Wireless Charger)', 'entertainment', '⚡'),
  ('ช่องเชื่อมต่อ USB-C / Type-A', 'entertainment', '🔌'),
  ('ถุงลมนิรภัยรอบคัน (SRS Airbags)', 'safety', '🛡️'),
  ('ระบบเบรก ABS / EBD / BA', 'safety', '🛑'),
  ('ระบบควบคุมเสถียรภาพการทรงตัว (VSA/ESP)', 'safety', '🛡️'),
  ('ระบบช่วยออกตัวบนทางลาดชัน (HSA)', 'safety', '🛡️'),
  ('กล้องมองภาพขณะถอยจอดพร้อมเส้นกะระยะ', 'safety', '📷'),
  ('กล้องมองภาพรอบทิศทาง 360 องศา', 'safety', '📷'),
  ('เซนเซอร์กะระยะช่วยจอด หน้า-หลัง', 'safety', '📡'),
  ('ระบบเตือนมุมอับสายตา (BSM)', 'safety', '👁️'),
  ('ระบบเตือนเมื่อออกนอกเลน (LDW/LKA)', 'safety', '🛣️'),
  ('ระบบเตือนการชนด้านหน้าพร้อมเบรกอัตโนมัติ', 'safety', '⚠️'),
  ('ระบบควบคุมความเร็วอัตโนมัติแบบแปรผัน (ACC)', 'performance', '🏎️'),
  ('แป้นเปลี่ยนเกียร์ที่พวงมาลัย (Paddle Shift)', 'performance', '🕹️'),
  ('โหมดการขับขี่ Eco / Normal / Sport', 'performance', '⚡'),
  ('ไฟหน้า Projector Lens แบบ LED', 'appearance', '💡'),
  ('ไฟส่องสว่างเวลากลางวัน Daytime Running Lights', 'appearance', '💡'),
  ('ไฟท้ายแบบ LED Light Guiding', 'appearance', '💡'),
  ('ล้ออัลลอยแท้ศูนย์ตกแต่งสปอร์ต', 'appearance', '🛞'),
  ('สปอยเลอร์หลังพร้อมไฟเบรกดวงที่ 3', 'appearance', '🚘'),
  ('ชุดแต่งสเกิร์ตรอบคัน', 'appearance', '✨')
ON CONFLICT (name) DO NOTHING;
