import React, { useState } from 'react';
import AppShell from '../layouts/AppShell';
import StatCard from '../components/common/StatCard';
import AdminCarManager from '../components/car/AdminCarManager';
import AdminPayoutManager from '../components/car/AdminPayoutManager';
import ChatWidget from '../components/common/ChatWidget';
import AdminSettings from '../components/admin/AdminSettings';

export function AdminDashboard({
  agents,
  setAgents,
  advertisers,
  setAdvertisers,
  cars,
  setCars,
  leads,
  setLeads,
  carFeatures,
  setCarFeatures,
  tab,
  setTab,
  onLogout,
  showToast,
}) {
  const tabs = [
    { id: 'overview', label: 'ภาพรวม', icon: '⌂' },
    { id: 'messages', label: 'ข้อความ', icon: '✉' },
    { id: 'agents', label: 'นายหน้า', icon: '♙' },
    { id: 'advertisers', label: 'Advertiser', icon: '◇' },
    { id: 'cars', label: 'จัดการรถ', icon: '▣' },
    { id: 'leads', label: 'ลูกค้า/การขาย', icon: '◎' },
    { id: 'payouts', label: 'การจ่ายเงิน', icon: '฿' },
    { id: 'settings', label: 'ตั้งค่า', icon: '⚙' },
  ];

  const approveAgent = (id) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a)));
    showToast('อนุมัตินายหน้าแล้ว');
  };

  const approveAdvertiser = (id) => {
    setAdvertisers((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a)));
    showToast('อนุมัติ Advertiser แล้ว');
  };

  const updateLeadField = (leadId, field, value) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, [field]: value } : l)));
  };

  const pendingAgents = agents.filter((a) => a.status === 'pending');
  const approvedAgents = agents.filter((a) => a.status === 'approved');

  const pendingAdvertisers = advertisers.filter((a) => a.status === 'pending');
  const approvedAdvertisers = advertisers.filter((a) => a.status === 'approved');

  const activeCars = cars.filter((c) => c.status === 'active');

  return (
    <AppShell
      role="ผู้ดูแลระบบ"
      name="CLUBROD Admin"
      tabs={tabs}
      activeTab={tab}
      onTab={setTab}
      onLogout={onLogout}
    >
      <div className="dashboard-content admin-content">
        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="welcome-row">
              <div>
                <span>ศูนย์ควบคุมระบบ</span>
                <h1>ภาพรวม CLUBROD</h1>
                <p>ติดตามนายหน้า ลูกค้า การขาย และการจ่ายเงิน</p>
              </div>
              <button
                type="button"
                className="button"
                onClick={() => setTab('cars')}
              >
                + สร้างประกาศรถ
              </button>
            </div>

            <div className="stats-grid">
              <StatCard
                label="นายหน้าที่อนุมัติ"
                value={String(approvedAgents.length)}
                note={`${pendingAgents.length} รายรอตรวจ`}
                icon="♙"
              />
              <StatCard
                label="รถที่เปิด Affiliate"
                value={String(activeCars.length)}
                note="พร้อมสร้างลิงก์"
                icon="▣"
              />
              <StatCard
                label="Advertiser"
                value={String(approvedAdvertisers.length)}
                note={`${pendingAdvertisers.length} ร้านรอตรวจ`}
                icon="◇"
              />
              <StatCard
                label="ลูกค้าทั้งหมด"
                value={String(leads.length)}
                note="ข้อมูลไม่ซ้ำ"
                icon="◎"
              />
              <StatCard
                label="ค่าคอมรอจ่าย"
                value="฿7,000"
                note="1 รายการ"
                icon="฿"
                orange
              />
            </div>

            <div className="dashboard-grid admin-grid">
              <section className="panel">
                <div className="panel-title">
                  <div>
                    <h2>ใบสมัครรออนุมัติ</h2>
                    <p>นายหน้าที่ยังไม่สามารถสร้างลิงก์ได้</p>
                  </div>
                  <button type="button" onClick={() => setTab('agents')}>
                    ดูทั้งหมด →
                  </button>
                </div>

                <div className="approval-list">
                  {pendingAgents.length > 0 ? (
                    pendingAgents.map((agent) => (
                      <div key={agent.id}>
                        <div className="user-avatar">{agent.name ? agent.name[0] : 'A'}</div>
                        <div>
                          <strong>{agent.name}</strong>
                          <small>{agent.phone} · {agent.province}</small>
                        </div>
                        <button
                          type="button"
                          className="button small"
                          onClick={() => approveAgent(agent.id)}
                        >
                          อนุมัติ
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-cell">ไม่มีใบสมัครรออนุมัติ</div>
                  )}
                </div>
              </section>

              <section className="panel">
                <div className="panel-title">
                  <div>
                    <h2>สถานะระบบ</h2>
                    <p>การตั้งค่าหลักของเวอร์ชันต้นแบบ</p>
                  </div>
                </div>

                <div className="system-list">
                  <span>
                    <i /> First-touch <b>30 วัน</b>
                  </span>
                  <span>
                    <i /> ค่ากลางนายหน้า <b>70%</b>
                  </span>
                  <span>
                    <i /> OTP <b>เตรียมพร้อม / ปิด</b>
                  </span>
                  <span>
                    <i /> อันดับนายหน้า <b>ปิด</b>
                  </span>
                </div>
              </section>
            </div>
          </>
        )}

        {/* TAB 2: MESSAGES (ข้อความ) */}
        {tab === 'messages' && <ChatWidget showToast={showToast} />}

        {/* TAB 3: AGENTS (จัดการนายหน้า) */}
        {tab === 'agents' && (
          <>
            <div className="page-title">
              <div>
                <h1>จัดการนายหน้า</h1>
                <p>อนุมัติ ระงับ และขอข้อมูลเพิ่มเติมภายหลัง</p>
              </div>
            </div>
            <section className="panel">
              <div className="agent-admin-list">
                {agents.map((agent) => (
                  <div key={agent.id}>
                    <div className="user-avatar">{agent.name ? agent.name[0] : 'A'}</div>
                    <div>
                      <strong>{agent.name}</strong>
                      <small>
                        {agent.phone} · LINE: {agent.line || '–'} · {agent.province}
                      </small>
                    </div>
                    <b className={agent.status === 'approved' ? 'badge success' : 'badge warning'}>
                      {agent.status === 'approved' ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
                    </b>
                    {agent.status === 'pending' && (
                      <button
                        type="button"
                        className="button small"
                        onClick={() => approveAgent(agent.id)}
                      >
                        อนุมัติ
                      </button>
                    )}
                    <button
                      type="button"
                      className="icon-button"
                      title="ขอข้อมูลเพิ่มเติม"
                      onClick={() => showToast(`ส่งคำขอข้อมูลเพิ่มเติมไปยัง ${agent.name}`)}
                    >
                      ⋯
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* TAB 4: ADVERTISERS (จัดการ Advertiser/เต็นท์รถ) */}
        {tab === 'advertisers' && (
          <>
            <div className="page-title">
              <div>
                <h1>จัดการ Advertiser</h1>
                <p>อนุมัติเต็นท์รถและตรวจสอบข้อมูลหน้าร้านทั่วประเทศ</p>
              </div>
            </div>
            <section className="panel">
              <div className="agent-admin-list">
                {advertisers.map((adv) => (
                  <div key={adv.id}>
                    <div className="user-avatar">{adv.storeName ? adv.storeName[0] : 'S'}</div>
                    <div>
                      <strong>{adv.storeName}</strong>
                      <small>
                        {adv.ownerName} · {adv.phone} · {adv.province}
                      </small>
                    </div>
                    <b className={adv.status === 'approved' ? 'badge success' : 'badge warning'}>
                      {adv.status === 'approved' ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
                    </b>
                    {adv.status === 'pending' && (
                      <button
                        type="button"
                        className="button small"
                        onClick={() => approveAdvertiser(adv.id)}
                      >
                        อนุมัติร้าน
                      </button>
                    )}
                    <button
                      type="button"
                      className="icon-button"
                      title="ดูข้อมูลร้าน"
                      onClick={() => showToast(`ดูข้อมูลร้าน ${adv.storeName}`)}
                    >
                      ⋯
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* TAB 5: CARS (จัดการรถ) */}
        {tab === 'cars' && (
          <AdminCarManager
            cars={cars}
            setCars={setCars}
            advertisers={advertisers}
            carFeatures={carFeatures}
            showToast={showToast}
          />
        )}

        {/* TAB 6: LEADS (ลูกค้า/การขาย) */}
        {tab === 'leads' && (
          <>
            <div className="page-title">
              <div>
                <h1>ลูกค้าและสถานะการขาย</h1>
                <p>แยกลูกค้าจากนายหน้าและลูกค้าที่เข้าหน้ารวมรถโดยตรง</p>
              </div>
            </div>
            <section className="panel standalone">
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ลูกค้า</th>
                      <th>แหล่งที่มา</th>
                      <th>สถานะ Lead</th>
                      <th>สถานะการขาย</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <strong>{lead.name}</strong>
                          <small>{lead.phone}</small>
                        </td>
                        <td>
                          {lead.agentCode === 'PLATFORM' ? (
                            <b className="badge platform">แพลตฟอร์มโดยตรง</b>
                          ) : (
                            <>
                              <strong>{lead.agentCode}</strong>
                              <small>ลิงก์นายหน้า</small>
                            </>
                          )}
                        </td>
                        <td>
                          <select
                            value={lead.leadStatus || 'ใหม่'}
                            onChange={(e) => updateLeadField(lead.id, 'leadStatus', e.target.value)}
                          >
                            <option>ใหม่</option>
                            <option>กำลังติดตาม</option>
                            <option>นัดดูรถ</option>
                            <option>ไม่สำเร็จ</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={lead.saleStatus || 'สนใจรถ'}
                            onChange={(e) => updateLeadField(lead.id, 'saleStatus', e.target.value)}
                          >
                            <option>สนใจรถ</option>
                            <option>จอง</option>
                            <option>ไฟแนนซ์</option>
                            <option>ส่งมอบสำเร็จ</option>
                            <option>ยกเลิก</option>
                            <option>ไฟแนนซ์ไม่ผ่าน</option>
                            <option>รถขายแล้ว</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* TAB 7: PAYOUTS (การจ่ายเงิน) */}
        {tab === 'payouts' && (
          <AdminPayoutManager
            leads={leads}
            updateLead={updateLeadField}
            showToast={showToast}
          />
        )}

        {/* TAB 8: SETTINGS (ตั้งค่า) */}
        {tab === 'settings' && (
          <AdminSettings
            carFeatures={carFeatures}
            setCarFeatures={setCarFeatures}
            showToast={showToast}
          />
        )}
      </div>
    </AppShell>
  );
}

export default AdminDashboard;
