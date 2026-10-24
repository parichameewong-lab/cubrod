import React, { useState, useEffect, useCallback } from 'react';
import { fetchConversations, sendChatMessage } from '../../services/api';
import { formatNumber } from '../../utils/formatters';

export function ChatWidget({ cars = [], agents = [], showToast }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'unreplied' | 'affiliate'

  const loadChats = useCallback(async () => {
    try {
      const list = await fetchConversations();
      setConversations(list);
      if (list.length > 0 && !activeId) {
        setActiveId(list[0].id);
      }
    } catch {
      // Fallback handled in service
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const filteredConversations = conversations.filter((conv) => {
    if (filterMode === 'unreplied') return conv.needsAdminReply;
    if (filterMode === 'affiliate') return conv.agentCode && conv.agentCode !== 'PLATFORM';
    return true;
  });

  const activeConv =
    conversations.find((c) => c.id === activeId) || filteredConversations[0] || conversations[0];

  const matchedCar = activeConv
    ? cars.find((c) => c.id === activeConv.carId || c.title === activeConv.carTitle)
    : null;

  const matchedAgent =
    activeConv && activeConv.agentCode && activeConv.agentCode !== 'PLATFORM'
      ? agents.find(
          (a) => a.code?.toLowerCase() === activeConv.agentCode?.toLowerCase()
        )
      : null;

  const unrepliedCount = conversations.filter((c) => c.needsAdminReply).length;

  const adminQuickReplies = [
    'สวัสดีครับ รถคันนี้ยังอยู่ พร้อมนัดดูรถจริงได้ครับ',
    'ราคาสามารถพูดคุยต่อรองหน้างานได้ครับ สะดวกนัดชมวันไหนดีครับ?',
    'คันนี้จัดไฟแนนซ์ได้ครับ เดี๋ยวเจ้าหน้าที่ฝ่ายสินเชื่อโทรแจ้งรายละเอียดให้ครับ',
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeConv || sending) return;
    const msgText = inputMsg.trim();
    setInputMsg('');
    setSending(true);

    try {
      const updated = await sendChatMessage(activeConv.id, msgText, 'admin');
      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      showToast('ส่งข้อความตอบกลับลูกค้าแล้ว');
    } catch {
      showToast('ส่งข้อความไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="panel chat-panel">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0 }}>ระบบแชตสนทนาลูกค้า (Live Chat & Attribution)</h2>
            {unrepliedCount > 0 && (
              <span className="badge warning">รอตอบกลับ {unrepliedCount} รายการ</span>
            )}
          </div>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
            เก็บประวัติถาวร พร้อมระบุโพสต์รถที่ลูกค้าสนใจและลิงก์นายหน้าผู้แนะนำอัตโนมัติ
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`button small ${filterMode === 'all' ? '' : 'secondary'}`}
            onClick={() => setFilterMode('all')}
          >
            ทั้งหมด ({conversations.length})
          </button>
          <button
            type="button"
            className={`button small ${filterMode === 'unreplied' ? '' : 'secondary'}`}
            onClick={() => setFilterMode('unreplied')}
          >
            รอตอบ ({unrepliedCount})
          </button>
          <button
            type="button"
            className={`button small ${filterMode === 'affiliate' ? '' : 'secondary'}`}
            onClick={() => setFilterMode('affiliate')}
          >
            จากลิงก์นายหน้า
          </button>
          <button type="button" className="button small secondary" onClick={loadChats}>
            🔄 รีเฟรช
          </button>
        </div>
      </div>

      <div className="chat-layout">
        <aside className="conv-list">
          {loading ? (
            <div className="empty-chat">กำลังโหลดประวัติแชต...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="empty-chat">ยังไม่มีรายการแชตในหมวดนี้</div>
          ) : (
            filteredConversations.map((conv) => {
              const isAgentRef = conv.agentCode && conv.agentCode !== 'PLATFORM';
              return (
                <button
                  key={conv.id}
                  type="button"
                  className={`conv-item ${conv.id === activeConv?.id ? 'active' : ''}`}
                  onClick={() => setActiveId(conv.id)}
                  style={{ textAlign: 'left', display: 'grid', gap: '4px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                    <strong>{conv.customerName || 'ลูกค้าทั่วไป'}</strong>
                    {conv.needsAdminReply ? (
                      <span
                        style={{
                          fontSize: '11px',
                          background: '#fff7ed',
                          color: '#ea580c',
                          border: '1px solid #fdba74',
                          borderRadius: '999px',
                          padding: '1px 7px',
                          fontWeight: 700,
                        }}
                      >
                        รอตอบ
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          background: '#f0fdf4',
                          color: '#16a34a',
                          borderRadius: '999px',
                          padding: '1px 7px',
                        }}
                      >
                        ตอบแล้ว
                      </span>
                    )}
                  </div>

                  <small style={{ color: '#0f172a', fontWeight: 600 }}>
                    🚗 {conv.carTitle || 'สอบถามข้อมูลรถ'}
                  </small>

                  <small style={{ color: isAgentRef ? '#d97706' : '#64748b', fontSize: '12px' }}>
                    {isAgentRef ? `🤝 ลิงก์นายหน้า: ${conv.agentCode}` : '🌐 เข้าจากแพลตฟอร์มโดยตรง'}
                  </small>

                  <small
                    style={{
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    💬 {conv.lastMessage || 'ไม่มีข้อความ'}
                  </small>
                </button>
              );
            })
          )}
        </aside>

        <section className="chat-messages-area" style={{ display: 'flex', flexDirection: 'column' }}>
          {activeConv ? (
            <>
              {/* CONTEXT HEADER: CUSTOMER + CAR POST + AFFILIATE ATTRIBUTION */}
              <div
                style={{
                  padding: '14px 16px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  borderRadius: '12px 12px 0 0',
                  display: 'grid',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '16px', color: '#0f172a' }}>
                      👤 {activeConv.customerName || 'ลูกค้าทั่วไป'}
                    </strong>
                    {activeConv.customerPhone && (
                      <span style={{ marginLeft: '10px', fontSize: '14px', color: '#334155' }}>
                        📞{' '}
                        <a
                          href={`tel:${activeConv.customerPhone}`}
                          style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}
                        >
                          {activeConv.customerPhone}
                        </a>
                      </span>
                    )}
                  </div>

                  {/* Attribution Pill */}
                  <div>
                    {activeConv.agentCode && activeConv.agentCode !== 'PLATFORM' ? (
                      <span className="badge warning" style={{ fontSize: '12px' }}>
                        🤝 แนะนำโดยลิงก์นายหน้า: {matchedAgent ? `${matchedAgent.name} (${activeConv.agentCode})` : activeConv.agentCode}
                      </span>
                    ) : (
                      <span className="badge platform" style={{ fontSize: '12px' }}>
                        🌐 ลูกค้าจากหน้าเว็บโดยตรง (PLATFORM)
                      </span>
                    )}
                  </div>
                </div>

                {/* Car Post Info Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    padding: '8px 12px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b' }}>ทักมาจากโพสต์รถ: </span>
                    <strong style={{ color: '#0f172a' }}>{activeConv.carTitle}</strong>
                    {matchedCar && (
                      <span style={{ color: '#ea580c', fontWeight: 700, marginLeft: '8px' }}>
                        (฿{formatNumber(matchedCar.price)} · ปี {matchedCar.year} · {matchedCar.province})
                      </span>
                    )}
                  </div>
                  {activeConv.sourceUrl && (
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      🔗 ลิงก์ต้นทาง: <code>{activeConv.sourceUrl.replace(/^https?:\/\/[^/]+/, '') || '/'}</code>
                    </span>
                  )}
                </div>
              </div>

              {/* MESSAGES STREAM */}
              <div className="messages-stream" style={{ flex: 1 }}>
                {(activeConv.messages || []).map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`chat-bubble ${m.sender === 'admin' ? 'self' : 'peer'}`}
                  >
                    <small
                      style={{
                        display: 'block',
                        fontWeight: 700,
                        marginBottom: '2px',
                        opacity: 0.85,
                      }}
                    >
                      {m.sender === 'admin'
                        ? '👑 แอดมิน CUBROD'
                        : `👤 ${m.senderName || activeConv.customerName || 'ลูกค้า'}`}
                    </small>
                    <span>{m.text}</span>
                    <small>{m.time || 'เมื่อสักครู่'}</small>
                  </div>
                ))}
              </div>

              {/* QUICK REPLIES FOR ADMIN */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                  padding: '8px 12px 0',
                }}
              >
                {adminQuickReplies.map((qr, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInputMsg(qr)}
                    style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    + {qr}
                  </button>
                ))}
              </div>

              {/* REPLY INPUT */}
              <form className="chat-input-form" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder={`ตอบกลับคุณ ${activeConv.customerName || 'ลูกค้า'}...`}
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" disabled={sending}>
                  {sending ? 'กำลังส่ง...' : 'ส่งคำตอบ'}
                </button>
              </form>
            </>
          ) : (
            <div className="chat-placeholder">เลือกรายการแชตทางซ้ายเพื่อดูประวัติและตอบกลับลูกค้า</div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ChatWidget;
