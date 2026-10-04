/**
 * API Abstraction Service for CUBROD
 * Handles endpoints detected in the production bundle:
 * - /api/inspection-reports
 * - /api/chats
 */

export const uploadInspectionReport = async (carId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('carId', carId);

  const res = await fetch('/api/inspection-reports', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Upload failed');
  }

  return data;
};

export const fetchConversations = async () => {
  const res = await fetch('/api/chats', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error('Failed to fetch conversations');
  }
  return data.conversations || [];
};

export const sendChatMessage = async (conversationId, message, sender = 'admin') => {
  const res = await fetch('/api/chats?action=reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, message, sender }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error('Failed to send message');
  }
  return data;
};

export const createConversation = async (carId, agentCode, initialMessage) => {
  const res = await fetch('/api/chats?action=create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ carId, agentCode, message: initialMessage }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error('Failed to create chat conversation');
  }
  return data;
};
