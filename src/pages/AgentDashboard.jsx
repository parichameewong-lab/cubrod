import React, { useState } from 'react';
import AppShell from '../layouts/AppShell';
import StatCard from '../components/common/StatCard';
import AgentCarList from '../components/car/AgentCarList';
import CreateLinkModal from '../components/agent/CreateLinkModal';
import { formatNumber } from '../utils/formatters';

export function AgentDashboard({
  agent,
  cars,
  leads,
  tab,
  setTab,
  onLogout,
  onPreview,
  onPreviewStorefront,
  showToast,
}) {
  const [showCreateLink, setShowCreateLink] = useState(false);

  const tabs = [
    { id: 'overview', label: 'ภาพรวม', icon: '⌂' },
    { id: 'cars', label: 'เลือกรถ', icon: '▣' },
    { id: 'leads', label: 'ลูกค้าของฉัน', icon: '♙' },
    { id: 'income', label: 'รายได้', icon: '฿' },
    { id: 'profile', label: 'โปรไฟล์', icon: '○' },
  ];

  const myLeads = leads.filter((l) => l.agentCode === agent.code);
  const paidLeads = myLeads.filter((l) => l.payoutStatus === 'โอนเงินสำเร็จแล้ว' || l.payoutStatus === 'จ่ายแล้ว');
  
  // Calculate income or fallbacks matching mockup
  const paidIncome = paidLeads.length > 0 ? paidLeads.length * 7700 : 7700;
  const pendingIncome = 7000;
  const totalCommission = paidIncome + pendingIncome;

  // Mask phone number for customer privacy
  const maskPhone = (phone) => {
    if (!phone) return '08X-XXX-XXXX';
    if (phone.length >= 10) {
      return `${phone.substring(0, 3)}-XXX-${phone.substring(7)}`;
    }
    return phone;
  };

  // 1. PENDING STATE (เมื่อบัญชีรอแอดมินอนุมัติ)
  if (agent.status === 'pending') {
    return (
      <AppShell
        role="บัญชีรออนุมัติ"
        name={agent.name}
        tabs={tabs}
        activeTab={tab}
        onTab={setTab}
        onLogout={onLogout}
      >
        <div className="pending-page">
          <div className="pending-icon">⌛</div>
          <span className="eyebrow">ตรวจสอบใบสมัคร</span>
          <h1>ทีมงานกำลังตรวจสอบข้อมูลของคุณ</h1>
          <p>
            เมื่อแอดมินอนุมัติแล้ว คุณจะสามารถเลือกรถและสร้างลิงก์นายหน้าได้
            ระบบจะแสดงสถานะใหม่เมื่อเข้าสู่ระบบครั้งถัดไป
          </p>
          <div className="application-card">
            <div>
              <span>ชื่อผู้สมัคร</span>
              <strong>{agent.name}</strong>
            </div>
            <div>
              <span>เบอร์โทร</span>
              <strong>{agent.phone}</strong>
            </div>
            <div>
              <span>สถานะ</span>
              <b className="badge warning">รออนุมัติ</b>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // 2. APPROVED STATE (เมื่ออนุมัติแล้ว)
  return (
    <AppShell
      role="นายหน้า"
      name={agent.name}
      tabs={tabs}
      activeTab={tab}
      onTab={setTab}
      onLogout={onLogout}
    >
      <div className="dashboard-content">
        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="welcome-row">
              <div>
                <span>วันอาทิตย์ที่ 19 กรกฎาคม 2569</span>
                <h1>สวัสดีครับ คุณ{agent.name.split(' ')[0]} 👋</h1>
                <p>นี่คือภาพรวมผลงานของคุณในเดือนนี้</p>
              </div>
              <button
                type="button"
                className="button"
                onClick={() => setTab('cars')}
              >
                + สร้างลิงก์ใหม่
              </button>
            </div>

            <div className="stats-grid">
              <StatCard
                label="คลิกลิงก์"
                value="128"
                note="↑ 18% จากเดือนก่อน"
                icon="↗"
              />
              <StatCard
                label="ลูกค้าที่สนใจ"
                value={String(myLeads.length + 4)}
                note="2 รายการใหม่"
                icon="♙"
              />
              <StatCard
                label="ขายสำเร็จ"
                value="2"
                note="เดือนนี้"
                icon="✓"
              />
              <StatCard
                label="ค่าคอมมิชชัน"
                value={`฿${formatNumber(totalCommission)}`}
                note="เฉพาะส่วนของคุณ"
                icon="฿"
                orange
              />
            </div>

            <div className="dashboard-grid">
              <section className="panel">
                <div className="panel-title">
                  <div>
                    <h2>ลูกค้าล่าสุด</h2>
                    <p>ทีม CUBROD เป็นผู้ติดต่อลูกค้า</p>
                  </div>
                  <button type="button" onClick={() => setTab('leads')}>
                    ดูทั้งหมด →
                  </button>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ลูกค้า</th>
                        <th>รถที่สนใจ</th>
                        <th>สถานะ</th>
                        <th>การขาย</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myLeads.length > 0 ? (
                        myLeads.map((lead) => {
                          const car = cars.find((c) => c.id === lead.carId);
                          return (
                            <tr key={lead.id}>
                              <td>
                                <strong>{lead.name}</strong>
                                <small>{maskPhone(lead.phone)}</small>
                              </td>
                              <td>{car ? car.title : 'รถคันอื่น'}</td>
                              <td>
                                <b className="badge info">{lead.leadStatus || 'กำลังติดตาม'}</b>
                              </td>
                              <td>
                                <b className={lead.saleStatus === 'จอง' ? 'badge success' : 'badge neutral'}>
                                  {lead.saleStatus || 'สนใจรถ'}
                                </b>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <>
                          <tr>
                            <td>
                              <strong>คุณกิตติ</strong>
                              <small>08X-XXX-4567</small>
                            </td>
                            <td>Nissan Note 1.2 VL</td>
                            <td><b className="badge info">กำลังติดตาม</b></td>
                            <td><b className="badge neutral">สนใจรถ</b></td>
                          </tr>
                          <tr>
                            <td>
                              <strong>คุณสุรีย์</strong>
                              <small>08X-XXX-1189</small>
                            </td>
                            <td>Toyota Yaris 1.2 G+</td>
                            <td><b className="badge info">นัดดูรถ</b></td>
                            <td><b className="badge success">จอง</b></td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="panel commission-panel">
                <span>รายได้เดือนนี้</span>
                <strong>฿14,700</strong>
                <div className="progress">
                  <i style={{ width: '68%' }} />
                </div>
                <div className="commission-split">
                  <span>
                    <i className="paid" /> จ่ายแล้ว <b>฿7,700</b>
                  </span>
                  <span>
                    <i className="waiting" /> รอจ่าย <b>฿7,000</b>
                  </span>
                </div>
                <button type="button" onClick={() => setTab('income')}>
                  ดูประวัติรายได้
                </button>
              </section>
            </div>
          </>
        )}

        {/* TAB 2: CARS (เลือกรถ & คัดลอกลิงก์นายหน้า) */}
        {tab === 'cars' && (
          <AgentCarList
            cars={cars}
            agent={agent}
            onPreview={onPreview}
            showToast={showToast}
          />
        )}

        {/* TAB 3: LEADS (ลูกค้าของฉัน) */}
        {tab === 'leads' && (
          <>
            <div className="page-title">
              <div>
                <h1>ลูกค้าของฉัน</h1>
                <p>ข้อมูลติดต่อถูกปกปิดเพื่อคุ้มครองข้อมูลส่วนบุคคล</p>
              </div>
            </div>
            <section className="panel standalone">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ลูกค้า</th>
                      <th>รถที่สนใจ</th>
                      <th>สถานะ</th>
                      <th>การขาย</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeads.length > 0 ? (
                      myLeads.map((lead) => {
                        const car = cars.find((c) => c.id === lead.carId);
                        return (
                          <tr key={lead.id}>
                            <td>
                              <strong>{lead.name}</strong>
                              <small>{maskPhone(lead.phone)}</small>
                            </td>
                            <td>{car ? car.title : 'รถคันอื่น'}</td>
                            <td><b className="badge info">{lead.leadStatus || 'กำลังติดตาม'}</b></td>
                            <td>
                              <b className={lead.saleStatus === 'จอง' ? 'badge success' : 'badge neutral'}>
                                {lead.saleStatus || 'สนใจรถ'}
                              </b>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="empty-cell">
                          ยังไม่มีลูกค้าจากลิงก์ของคุณ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* TAB 4: INCOME (รายได้) */}
        {tab === 'income' && (
          <>
            <div className="page-title">
              <h1>รายได้ของฉัน</h1>
              <p>ระบบแสดงเฉพาะค่าคอมมิชชันส่วนที่คุณได้รับ</p>
            </div>
            <div className="stats-grid three">
              <StatCard label="รายได้สะสม" value="฿28,700" note="3 การขาย" icon="฿" />
              <StatCard label="รอจ่าย" value="฿7,000" note="รอแอดมินอนุมัติ" icon="⌛" orange />
              <StatCard label="จ่ายแล้ว" value="฿21,700" note="โอนสำเร็จ" icon="✓" />
            </div>

            <section className="panel standalone">
              <div className="panel-title">
                <div>
                  <h2>ประวัติค่าคอมมิชชัน</h2>
                  <p>จ่ายเป็นรายคันผ่านช่องทางที่คุณเลือก</p>
                </div>
              </div>
              <div className="payout-list">
                <div>
                  <span className="payout-icon">✓</span>
                  <div>
                    <strong>Toyota Yaris 1.2 G+</strong>
                    <small>ส่งมอบ 12 ก.ค. 2569 · PromptPay</small>
                  </div>
                  <b>
                    +฿8,400<small>จ่ายแล้ว</small>
                  </b>
                </div>
                <div>
                  <span className="payout-icon waiting">⌛</span>
                  <div>
                    <strong>Nissan Note 1.2 VL</strong>
                    <small>ส่งมอบ 18 ก.ค. 2569</small>
                  </div>
                  <b>
                    +฿7,000<small className="orange-text">รอตรวจสอบ</small>
                  </b>
                </div>
              </div>
            </section>
          </>
        )}

        {/* TAB 5: PROFILE (โปรไฟล์และการรับเงิน) */}
        {tab === 'profile' && (
          <>
            <div className="page-title">
              <h1>โปรไฟล์และการรับเงิน</h1>
              <p>คุณสามารถเพิ่มข้อมูลที่จำเป็นภายหลังได้</p>
            </div>
            <section className="panel profile-panel">
              <div className="profile-head">
                <div className="large-avatar">{agent.name ? agent.name[0] : 'A'}</div>
                <div>
                  <h2>{agent.name}</h2>
                  <p>
                    {agent.code} · <b className="badge success">อนุมัติแล้ว</b>
                  </p>
                </div>
              </div>
              <div className="profile-fields">
                <label>
                  <span>เบอร์โทร</span>
                  <input value={agent.phone || ''} readOnly />
                </label>
                <label>
                  <span>LINE ID</span>
                  <input value={agent.line || ''} readOnly />
                </label>
                <label>
                  <span>จังหวัด</span>
                  <input value={agent.province || ''} readOnly />
                </label>
                <label>
                  <span>ช่องทางรับเงิน</span>
                  <select defaultValue="promptpay">
                    <option value="promptpay">PromptPay</option>
                    <option value="bank">บัญชีธนาคาร</option>
                  </select>
                </label>
                <label className="full-field">
                  <span>หมายเลข PromptPay</span>
                  <input placeholder="กรอกก่อนขอรับค่าคอมมิชชัน" />
                </label>
              </div>
              <button
                type="button"
                className="button"
                onClick={() => showToast('บันทึกข้อมูลรับเงินแล้ว')}
              >
                บันทึกข้อมูล
              </button>
            </section>
          </>
        )}
      </div>

      {showCreateLink && (
        <CreateLinkModal
          agent={agent}
          cars={cars}
          onClose={() => setShowCreateLink(false)}
          onPreviewStorefront={onPreviewStorefront}
          showToast={showToast}
        />
      )}
    </AppShell>
  );
}

export default AgentDashboard;
