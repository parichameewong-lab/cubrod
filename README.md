# CUBROD — Editable Source Project & Local Recovery

โปรเจกต์นี้ได้รับการกู้คืนและแปลงจาก Production Build ให้กลายเป็น **Editable React Source Project** ที่รองรับ Vite สำหรับพัฒนาต่อได้โดยตรงใน Antigravity / VS Code

---

## 🚀 วิธีการรันโปรเจกต์ (Quick Start)

### ข้อกำหนด
- Node.js 18+ (แนะนำ Node.js 20 LTS)

### การติดตั้งและเริ่มทำงาน
```bash
# 1. ติดตั้ง dependencies
npm install

# 2. รันในโหมดพัฒนา (Development Mode)
npm run dev
```

เปิดเบราว์เซอร์ไปยัง URL ที่แสดงบน Terminal (ปกติคือ `http://localhost:5173/`)

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
CLUBROD-local-recovery/
├── public/                     # Static assets สำหรับ Vite dev/build
│   ├── assets/                 # Copy fonts, css, และ production static assets
│   └── favicon.svg
├── src/                        # 🌟 Editable Source Code (React 18 + Vite)
│   ├── components/
│   │   ├── common/             # Common UI (Logo, IconBox, StatCard, MultiImageUpload, ฯลฯ)
│   │   ├── auth/               # LoginForm, AgentRegisterForm, AdvertiserRegisterForm, AuthLayoutCard
│   │   ├── car/                # CarCard, CarDetailModal, AdminCarManager, AgentCarList, AdvertiserInventory
│   │   └── dashboard/          # LeadTable, PanelLayout
│   ├── pages/                  # หน้าเว็บหลัก (Home, AgentDashboard, AdvertiserDashboard, AdminDashboard)
│   ├── layouts/                # Header, Footer, AppShell (Sidebar Nav)
│   ├── data/                   # initialData.js (Sample Agents, Advertisers, Cars, Leads)
│   ├── services/               # storage.js (localStorage Service), api.js (API Service Abstraction)
│   ├── utils/                  # formatters.js (currency, masking, dedupe, helpers)
│   ├── styles/                 # index.css (CLUBROD Design System)
│   ├── App.jsx                 # App Router & Root State Management
│   └── main.jsx                # React Entry point
├── assets/                     # 🛡️ Production Build Backup (ต้นฉบับ HAR ที่กู้มา)
├── index.production-backup.html # 🛡️ HTML Backup จาก Production Build เดิม
├── index.html                  # HTML Shell สำหรับ Vite React
├── vite.config.js              # Vite React Plugin Configuration
├── package.json
├── .env.example
├── README.md
└── RECOVERY_NOTES.md
```

---

## 🔍 ข้อมูลระบบและ API / Storage ที่ตรวจพบ

### 💾 localStorage Keys
- `cc-cars`: ข้อมูลรายการรถยนต์ในระบบ
- `cc-agents`: ข้อมูลสมาชิกนายหน้า (Broker / Affiliate)
- `cc-advertisers`: ข้อมูลดีลเลอร์ / เต็นท์รถผู้ลงขาย
- `cc-leads`: ข้อมูลผู้สนใจซื้อรถที่ส่งมาจากฟอร์มหรือลิงก์นายหน้า
- `cc-first-touch`: ข้อมูลการติดตาม Referral Link (`ref` param)

### 🌐 API References
- `POST /api/inspection-reports`: อัปโหลด PDF รายงานตรวจสภาพรถ
- `GET /api/chats`: ดึงข้อความแชตสนทนา
- `POST /api/chats`: ส่งข้อความแชต และบริหารจัดการห้องแชต

---

## 🛠️ สิ่งที่ถูกแปลงเป็น Editable Source vs สิ่งที่เป็น Backup

### 🟢 แยกเป็น Editable Source แล้ว
- โครงสร้าง React Components ทั้งหมด (Home, Detail Modal, Agent/Advertiser/Admin Dashboards)
- State Management และ localStorage persistence logic ใน `src/services/storage.js`
- API Abstraction Services ใน `src/services/api.js`
- Design System และ Style classes ทั้งหมด
- Sample Datasets ใน `src/data/initialData.js`

### 🟡 สิ่งที่ยังเป็น Production Backup
- โฟลเดอร์ `assets/` เดิม ถูกรักษาไว้เพื่อเป็นหลักฐานอ้างอิง
- `index.production-backup.html` เก็บ Pre-rendered HTML จากระบบเดิมไว้เป็น Backup
