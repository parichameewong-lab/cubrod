/**
 * API & Live Chat Service for CLUBROD
 * Connects directly to Supabase `clubrod_chats` table with LocalStorage fallback.
 *
 * Quota & Privacy Mode (Option A + Zero-Polling):
 * - No background polling (0 idle requests). Only fetches on open, send, or manual refresh.
 * - Full history is visible on the customer's original device token; if the same phone number
 *   is used from another device, messages merge into the same room for Admin while only showing
 *   messages from the new session onwards on that new device.
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { uploadInspectionPdf } from './mediaUpload';

const LOCAL_CHATS_KEY = 'cc-chats';
const CUSTOMER_CHAT_SESSIONS_KEY = 'cc-customer-chat-sessions';
const CUSTOMER_PROFILE_KEY = 'cc-customer-chat-profile';

const getLocalChats = () => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_CHATS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setLocalChats = (chats) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CHATS_KEY, JSON.stringify(chats));
  } catch {
    // ignore storage quota errors
  }
};

export const getCustomerChatProfile = () => {
  if (typeof window === 'undefined') return { name: '', phone: '' };
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_PROFILE_KEY) || '{"name":"","phone":""}');
  } catch {
    return { name: '', phone: '' };
  }
};

export const saveCustomerChatProfile = (name, phone) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CUSTOMER_PROFILE_KEY,
      JSON.stringify({ name: (name || '').trim(), phone: (phone || '').trim() })
    );
  } catch {
    // ignore
  }
};

/**
 * Returns { id: string, visibleFrom: string } or null for a carId on this device
 */
export const getCustomerSessionForCar = (carId) => {
  if (typeof window === 'undefined' || !carId) return null;
  try {
    const map = JSON.parse(localStorage.getItem(CUSTOMER_CHAT_SESSIONS_KEY) || '{}');
    const entry = map[carId];
    if (!entry) return null;
    if (typeof entry === 'string') {
      return { id: entry, visibleFrom: '' };
    }
    return entry?.id ? entry : null;
  } catch {
    return null;
  }
};

export const getCustomerSessionIdForCar = (carId) => {
  return getCustomerSessionForCar(carId)?.id || '';
};

export const saveCustomerSessionForCar = (carId, conversationId, visibleFrom = '') => {
  if (typeof window === 'undefined' || !carId || !conversationId) return;
  try {
    const map = JSON.parse(localStorage.getItem(CUSTOMER_CHAT_SESSIONS_KEY) || '{}');
    const existing = map[carId];
    const existingObj =
      typeof existing === 'string' ? { id: existing, visibleFrom: '' } : existing;

    // Preserve earlier visibleFrom if already set on this same device for this conversation
    const finalVisibleFrom =
      existingObj && existingObj.id === conversationId
        ? existingObj.visibleFrom || ''
        : visibleFrom;

    map[carId] = { id: conversationId, visibleFrom: finalVisibleFrom };
    localStorage.setItem(CUSTOMER_CHAT_SESSIONS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
};

const formatThaiTime = (isoString) => {
  try {
    const d = isoString ? new Date(isoString) : new Date();
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
  } catch {
    return 'เมื่อสักครู่';
  }
};

const mapChatFromDb = (row) => {
  const messages = Array.isArray(row.messages) ? row.messages : [];
  const lastMsgObj = messages[messages.length - 1] || null;
  const firstMeta = messages.find((m) => m?.meta)?.meta || {};

  return {
    id: row.id,
    carId: row.car_id || '',
    agentCode: row.agent_code || 'PLATFORM',
    customerName: row.customer_name || 'ลูกค้าทั่วไป',
    customerPhone: row.customer_phone || '',
    carTitle: row.car_title || 'สอบถามข้อมูลรถ',
    lastMessage: row.last_message || lastMsgObj?.text || '',
    lastSender: lastMsgObj?.sender || 'customer',
    needsAdminReply: (lastMsgObj?.sender || 'customer') === 'customer',
    sourceUrl: firstMeta.sourceUrl || '',
    sourcePage: firstMeta.sourcePage || '',
    messages,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  };
};

const mapChatToDb = (conv) => ({
  id: conv.id,
  car_id: conv.carId || null,
  agent_code: conv.agentCode || 'PLATFORM',
  customer_name: conv.customerName || 'ลูกค้าทั่วไป',
  customer_phone: conv.customerPhone || '',
  car_title: conv.carTitle || 'สอบถามข้อมูลรถ',
  last_message: conv.lastMessage || '',
  messages: Array.isArray(conv.messages) ? conv.messages : [],
  updated_at: conv.updatedAt || new Date().toISOString(),
});

/**
 * Filter messages according to the device's session privacy window (Option A)
 */
const filterMessagesForCustomerDevice = (conv, visibleFrom) => {
  if (!conv) return null;
  if (!visibleFrom) return conv;
  const filtered = (conv.messages || []).filter(
    (m) => !m.createdAt || m.createdAt >= visibleFrom
  );
  return {
    ...conv,
    messages: filtered,
  };
};

/**
 * Upload Inspection PDF (delegates to mediaUpload service)
 */
export const uploadInspectionReport = async (carId, file) => {
  return uploadInspectionPdf(file, carId);
};

/**
 * Fetch all chat conversations for Admin Dashboard (full history)
 */
export const fetchConversations = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('clubrod_chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map(mapChatFromDb);
        setLocalChats(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase clubrod_chats fetch failed, using local cache:', err);
    }
  }
  return getLocalChats();
};

/**
 * Fetch a single conversation by ID (full raw conversation)
 */
export const fetchConversationById = async (conversationId) => {
  if (!conversationId) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('clubrod_chats')
        .select('*')
        .eq('id', conversationId)
        .maybeSingle();

      if (!error && data) {
        return mapChatFromDb(data);
      }
    } catch (err) {
      console.warn('fetchConversationById fallback:', err);
    }
  }

  const localList = getLocalChats();
  return localList.find((c) => c.id === conversationId) || null;
};

/**
 * Fetch conversation for a Customer on their device (respects Option A privacy)
 */
export const fetchCustomerDeviceConversation = async (carId) => {
  const session = getCustomerSessionForCar(carId);
  if (!session?.id) return null;
  const conv = await fetchConversationById(session.id);
  return filterMessagesForCustomerDevice(conv, session.visibleFrom);
};

/**
 * Customer starts or continues a conversation on a specific Car Post
 */
export const sendCustomerChatMessage = async ({
  carId,
  carTitle,
  agentCode = 'PLATFORM',
  customerName,
  customerPhone,
  message,
  sourceUrl = '',
  sourcePage = '',
}) => {
  const nowIso = new Date().toISOString();
  const cleanName = (customerName || 'ลูกค้า').trim();
  const cleanPhone = (customerPhone || '').trim();
  const cleanMsg = (message || '').trim();

  // 1. Check if this device already owns a session for this car
  const deviceSession = getCustomerSessionForCar(carId);
  let existingConv = deviceSession?.id ? await fetchConversationById(deviceSession.id) : null;
  let isMergedFromOtherDevice = false;

  // 2. Option A: If this device has no session yet, check if the same phone number
  // already has a room for this car so Admin sees everything in one place,
  // but mark isMergedFromOtherDevice = true so old messages aren't exposed to this browser.
  if (!existingConv && cleanPhone && isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('clubrod_chats')
        .select('*')
        .eq('car_id', carId)
        .eq('customer_phone', cleanPhone)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        existingConv = mapChatFromDb(data[0]);
        isMergedFromOtherDevice = true;
      }
    } catch {
      // ignore
    }
  }

  const newMessageItem = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sender: 'customer',
    senderName: cleanName,
    text: cleanMsg,
    time: formatThaiTime(nowIso),
    createdAt: nowIso,
    meta: {
      carId,
      carTitle,
      agentCode: agentCode || 'PLATFORM',
      sourceUrl: sourceUrl || (typeof window !== 'undefined' ? window.location.href : ''),
      sourcePage: sourcePage || 'หน้ารายละเอียดรถ',
    },
  };

  const convId = existingConv?.id || `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const updatedMessages = [...(existingConv?.messages || []), newMessageItem];

  const updatedConv = {
    id: convId,
    carId,
    carTitle: carTitle || existingConv?.carTitle || 'สอบถามข้อมูลรถ',
    agentCode:
      existingConv?.agentCode && existingConv.agentCode !== 'PLATFORM'
        ? existingConv.agentCode
        : agentCode || 'PLATFORM',
    customerName: cleanName || existingConv?.customerName || 'ลูกค้าทั่วไป',
    customerPhone: cleanPhone || existingConv?.customerPhone || '',
    lastMessage: cleanMsg,
    lastSender: 'customer',
    needsAdminReply: true,
    sourceUrl: newMessageItem.meta.sourceUrl,
    sourcePage: newMessageItem.meta.sourcePage,
    messages: updatedMessages,
    createdAt: existingConv?.createdAt || nowIso,
    updatedAt: nowIso,
  };

  if (isSupabaseConfigured()) {
    try {
      const payload = mapChatToDb(updatedConv);
      const { error } = await supabase.from('clubrod_chats').upsert(payload);
      if (error) throw error;
    } catch (err) {
      console.warn('Supabase clubrod_chats upsert failed, saving locally:', err);
    }
  }

  const currentLocal = getLocalChats();
  const existsLocally = currentLocal.some((c) => c.id === convId);
  const nextLocal = existsLocally
    ? currentLocal.map((c) => (c.id === convId ? updatedConv : c))
    : [updatedConv, ...currentLocal];
  setLocalChats(nextLocal);

  // If merged from another device by phone, only show messages from nowIso onwards on this device
  const visibleFrom = isMergedFromOtherDevice ? nowIso : deviceSession?.visibleFrom || '';
  saveCustomerSessionForCar(carId, convId, visibleFrom);
  saveCustomerChatProfile(cleanName, cleanPhone);

  return filterMessagesForCustomerDevice(updatedConv, visibleFrom);
};

/**
 * Legacy helper kept for backward compatibility
 */
export const createConversation = async (carId, agentCode, initialMessage, extra = {}) => {
  return sendCustomerChatMessage({
    carId,
    carTitle: extra.carTitle || 'สอบถามข้อมูลรถ',
    agentCode,
    customerName: extra.customerName || 'ลูกค้า',
    customerPhone: extra.customerPhone || '',
    message: initialMessage,
    sourceUrl: extra.sourceUrl || '',
    sourcePage: extra.sourcePage || '',
  });
};

/**
 * Admin sends a reply in an existing conversation
 */
export const sendChatMessage = async (conversationId, message, sender = 'admin') => {
  const nowIso = new Date().toISOString();
  const cleanMsg = (message || '').trim();
  if (!conversationId || !cleanMsg) {
    throw new Error('กรุณาระบุข้อความ');
  }

  const existing = await fetchConversationById(conversationId);
  if (!existing) {
    throw new Error('ไม่พบห้องสนทนานี้');
  }

  const replyItem = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sender,
    senderName: sender === 'admin' ? 'แอดมิน CUBROD' : existing.customerName,
    text: cleanMsg,
    time: formatThaiTime(nowIso),
    createdAt: nowIso,
  };

  const updatedConv = {
    ...existing,
    lastMessage: cleanMsg,
    lastSender: sender,
    needsAdminReply: sender !== 'admin',
    messages: [...(existing.messages || []), replyItem],
    updatedAt: nowIso,
  };

  if (isSupabaseConfigured()) {
    try {
      const payload = mapChatToDb(updatedConv);
      const { error } = await supabase.from('clubrod_chats').upsert(payload);
      if (error) throw error;
    } catch (err) {
      console.warn('Supabase sendChatMessage error:', err);
    }
  }

  const currentLocal = getLocalChats();
  const nextLocal = currentLocal.map((c) => (c.id === conversationId ? updatedConv : c));
  setLocalChats(nextLocal);

  return updatedConv;
};
