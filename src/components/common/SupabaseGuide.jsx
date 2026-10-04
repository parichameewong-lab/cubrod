import React, { useState } from 'react';

export function SupabaseGuide({ showToast }) {
  const [completedSteps, setCompletedSteps] = useState([]);

  const toggleStep = (id) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const steps = [
    {
      id: 'supabase-project',
      number: '01',
      title: 'สมัครและสร้างโปรเจกต์',
      copy: 'เข้า Supabase กด New project ตั้งชื่อ cubrod-production เลือก Region ใกล้ประเทศไทย และตั้ง Database password ที่คาดเดายาก',
      linkText: 'เปิด Supabase Dashboard',
      linkUrl: 'https://supabase.com/dashboard',
    },
    {
      id: 'supabase-env',
      number: '02',
      title: 'คัดลอก URL และ Anon Key มาวางใน .env',
      copy: 'ไปที่ Project Settings -> API นำ SUPABASE_URL และ SUPABASE_ANON_KEY มากรอกในไฟล์ .env.local',
    },
    {
      id: 'supabase-schema',
      number: '03',
      title: 'รัน SQL Schema ย้ายข้อมูลจาก localStorage',
      copy: 'สร้างตาราง cars, agents, advertisers, leads ใน Supabase SQL Editor และปรับเปลี่ยนบริการใน src/services/storage.js เป็น Supabase client',
    },
  ];

  return (
    <div className="panel supabase-guide-panel">
      <h2>คู่มือการเชื่อมต่อ Supabase Database</h2>
      <p>ขั้นตอนการย้ายจาก LocalStorage Mock State ไปยัง Cloud Database</p>

      <div className="steps-list">
        {steps.map((step) => {
          const isDone = completedSteps.includes(step.id);
          return (
            <div key={step.id} className={`guide-step ${isDone ? 'done' : ''}`}>
              <button
                type="button"
                className="step-check"
                onClick={() => {
                  toggleStep(step.id);
                  if (!isDone) showToast(`ทำเครื่องหมายเรียบร้อย: ${step.title}`);
                }}
              >
                {isDone ? '✓' : step.number}
              </button>
              <div className="step-body">
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
                {step.linkUrl && (
                  <a href={step.linkUrl} target="_blank" rel="noreferrer" className="step-link">
                    {step.linkText} →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SupabaseGuide;
