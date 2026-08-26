/**
 * List of standard Car Features & Options with Categories & Icons
 * Compatible with Thai automotive market listings and user reference image
 */

export const CAR_FEATURE_CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'comfort', label: 'ความสะดวกสบาย & ภายใน' },
  { id: 'safety', label: 'ความปลอดภัย' },
  { id: 'multimedia', label: 'เครื่องเสียง & เทคโนโลยี' },
  { id: 'exterior', label: 'ภายนอก & ตกแต่ง' },
  { id: 'tools', label: 'อุปกรณ์ & อะไหล่' },
];

export const DEFAULT_CAR_FEATURES = [
  // 1. เครื่องเสียง & มัลติมีเดีย
  { name: 'เครื่องเล่นซีดี', category: 'multimedia', icon: '💿' },
  { name: 'วิทยุ', category: 'multimedia', icon: '📻' },
  { name: 'ดีวีดี', category: 'multimedia', icon: '📀' },
  { name: 'CD Changer', category: 'multimedia', icon: '💽' },
  { name: 'โทรทัศน์', category: 'multimedia', icon: '📺' },
  { name: 'การนำทาง', category: 'multimedia', icon: '🧭' },
  { name: 'Bluetooth / USB', category: 'multimedia', icon: '📱' },
  { name: 'Apple CarPlay', category: 'multimedia', icon: '⚡' },

  // 2. ความสะดวกสบาย & ภายใน
  { name: 'พวงมาลัยเพาเวอร์', category: 'comfort', icon: '🔄' },
  { name: 'พวงมาลัยมัลติฟังก์ชั่น', category: 'comfort', icon: '🎮' },
  { name: 'กระจกไฟฟ้า', category: 'comfort', icon: '🪟' },
  { name: 'กระจกพับไฟฟ้า', category: 'comfort', icon: '🪞' },
  { name: 'เครื่องปรับอากาศ', category: 'comfort', icon: '❄️' },
  { name: 'เบาะหนัง', category: 'comfort', icon: '💺' },
  { name: 'เบาะไฟฟ้า', category: 'comfort', icon: '⚡' },
  { name: 'ซันรูฟ', category: 'comfort', icon: '☀️' },
  { name: 'กดสตาร์ท', category: 'comfort', icon: '🔘' },
  { name: 'Keyless Entry', category: 'comfort', icon: '🔑' },
  { name: 'เซ็นทรัลล็อค', category: 'comfort', icon: '🔒' },

  // 3. ความปลอดภัย & ช่วยขับขี่
  { name: 'ABS', category: 'safety', icon: '🛑' },
  { name: 'ถุงลมนิรภัย', category: 'safety', icon: '🛡️' },
  { name: 'ถุงลมนิรภัยด้านข้าง', category: 'safety', icon: '🛡️' },
  { name: 'ESC', category: 'safety', icon: '⚖️' },
  { name: 'กล้องหลัง', category: 'safety', icon: '📷' },
  { name: 'กล้อง 360 องศา', category: 'safety', icon: '🔄' },
  { name: 'ไฟตัดหมอก', category: 'safety', icon: '💡' },

  // 4. ภายนอก & ตกแต่ง
  { name: 'ล้อแม็กซ์', category: 'exterior', icon: '🛞' },
  { name: 'สปอยเลอร์หลัง', category: 'exterior', icon: '🏎️' },
  { name: 'สเกิร์ตข้าง', category: 'exterior', icon: '🚘' },
  { name: 'ลิปสปอยเลอร์หน้า', category: 'exterior', icon: '🏁' },
  { name: 'ชุดบอดี้', category: 'exterior', icon: '✨' },
  { name: 'เทอร์โบ', category: 'exterior', icon: '⚡' },

  // 5. อุปกรณ์ & เครื่องมือ
  { name: 'ยางอะไหล่', category: 'tools', icon: '🛞' },
  { name: 'แจ็ค', category: 'tools', icon: '🔩' },
  { name: 'ประแจเลื่อนล้อ', category: 'tools', icon: '🔧' },
  { name: 'การ์ดยาง', category: 'tools', icon: '🛡️' },
  { name: 'ยางหลัง', category: 'tools', icon: '⚙️' },
];

/**
 * Get icon for a given feature name
 */
export function getFeatureIcon(name, featuresList = DEFAULT_CAR_FEATURES) {
  const list = Array.isArray(featuresList) && featuresList.length > 0 ? featuresList : DEFAULT_CAR_FEATURES;
  const match = list.find(
    (f) => (f.name || '').toLowerCase() === (name || '').toLowerCase()
  );
  return match ? match.icon : '✓';
}
