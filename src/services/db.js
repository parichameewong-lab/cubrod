/**
 * CLUBROD Database Service (Supabase + LocalStorage Fallback)
 * Works with tables prefixed with 'clubrod_*' to share Database with kaitong safely.
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { initialAgents, initialAdvertisers, initialCars, initialLeads } from '../data/initialData';
import { DEFAULT_CAR_FEATURES } from '../data/carFeatures';
import { getStorage, setStorage, KEYS } from './storage';

// -----------------------------------------------------------------------------
// HELPER: Map Database snake_case to Frontend camelCase and vice versa
// -----------------------------------------------------------------------------
const mapCarFromDb = (item) => ({
  id: item.id,
  title: item.title || '',
  brand: item.brand || '',
  model: item.model || '',
  submodel: item.submodel || '',
  year: item.year || '',
  price: Number(item.price || 0),
  downPayment: Number(item.down_payment || 0),
  monthlyPayment: Number(item.monthly_payment || 0),
  mileage: Number(item.mileage || 0),
  gear: item.gear || 'อัตโนมัติ',
  fuel: item.fuel || 'เบนซิน',
  color: item.color || '',
  licensePlate: item.license_plate || '',
  province: item.province || '',
  status: item.status || 'active',
  publicVisible: true,
  affiliateEnabled: true,
  isCubrodChoice: Boolean(item.is_cubrod_choice || item.is_clubrod_choice),
  isClubrodChoice: Boolean(item.is_cubrod_choice || item.is_clubrod_choice),
  featuredManual: Boolean(item.is_cubrod_choice || item.is_clubrod_choice),
  totalCommission: Number(item.commission_total || 0),
  agentCommission: Number(item.commission_agent || 0),
  agentPercent: item.commission_total > 0
    ? Math.round((Number(item.commission_agent || 0) / Number(item.commission_total)) * 100)
    : 70,
  advertiserId: item.advertiser_id || '',
  images: Array.isArray(item.images) ? item.images : [],
  features: Array.isArray(item.features) ? item.features : [],
  inspectionPdfUrl: item.inspection_pdf_url || '',
  createdAt: item.created_at,
});

const mapCarToDb = (car) => ({
  id: car.id,
  title: car.title || `${car.brand || ''} ${car.model || ''}`,
  brand: car.brand || '',
  model: car.model || '',
  submodel: car.submodel || '',
  year: Number(car.year || 0),
  price: Number(car.price || 0),
  down_payment: Number(car.downPayment || 0),
  monthly_payment: Number(car.monthlyPayment || 0),
  mileage: Number(car.mileage || 0),
  gear: car.gear || 'อัตโนมัติ',
  fuel: car.fuel || 'เบนซิน',
  color: car.color || '',
  license_plate: car.licensePlate || '',
  province: car.province || '',
  status: car.status || 'active',
  is_clubrod_choice: Boolean(car.isCubrodChoice || car.isClubrodChoice || car.featuredManual),
  commission_total: Number(car.totalCommission || 0),
  commission_agent: Number(car.agentCommission || (car.totalCommission ? (car.totalCommission * 0.7) : 0)),
  advertiser_id: car.advertiserId || null,
  images: Array.isArray(car.images) ? car.images : [],
  features: Array.isArray(car.features) ? car.features : [],
  inspection_pdf_url: car.inspectionPdfUrl || null,
  updated_at: new Date().toISOString(),
});

const mapAgentFromDb = (item) => ({
  id: item.id,
  code: item.code,
  name: item.name,
  phone: item.phone,
  line: item.line || '',
  province: item.province || '',
  status: item.status || 'pending',
  payoutType: item.payout_type || 'promptpay',
  payoutAccount: item.payout_account || '',
  createdAt: item.created_at,
});

const mapAgentToDb = (agent) => ({
  id: agent.id,
  code: agent.code,
  name: agent.name,
  phone: agent.phone,
  line: agent.line || '',
  province: agent.province || '',
  status: agent.status || 'pending',
  payout_type: agent.payoutType || 'promptpay',
  payout_account: agent.payoutAccount || '',
  updated_at: new Date().toISOString(),
});

const mapAdvertiserFromDb = (item) => ({
  id: item.id,
  storeName: item.store_name,
  ownerName: item.owner_name,
  phone: item.phone,
  line: item.line || '',
  province: item.province || '',
  address: item.address || '',
  status: item.status || 'pending',
  storefrontImageUrl: item.storefront_image_url || '',
  createdAt: item.created_at,
});

const mapAdvertiserToDb = (adv) => ({
  id: adv.id,
  store_name: adv.storeName,
  owner_name: adv.ownerName,
  phone: adv.phone,
  line: adv.line || '',
  province: adv.province || '',
  address: adv.address || '',
  status: adv.status || 'pending',
  storefront_image_url: adv.storefrontImageUrl || null,
  updated_at: new Date().toISOString(),
});

const mapLeadFromDb = (item) => ({
  id: item.id,
  carId: item.car_id,
  agentCode: item.agent_code || 'PLATFORM',
  name: item.name,
  phone: item.phone,
  line: item.line || '',
  contactTime: item.contact_time || '13:00–16:00 น.',
  leadStatus: item.lead_status || 'ใหม่',
  saleStatus: item.sale_status || 'สนใจรถ',
  payoutStatus: item.payout_status || 'ยังไม่เกิดสิทธิ์',
  commissionAmount: Number(item.commission_amount || 0),
  notes: item.notes || '',
  createdAt: item.created_at,
});

const mapLeadToDb = (lead) => ({
  id: lead.id,
  car_id: lead.carId || null,
  agent_code: lead.agentCode || 'PLATFORM',
  name: lead.name,
  phone: lead.phone,
  line: lead.line || '',
  contact_time: lead.contactTime || '13:00–16:00 น.',
  lead_status: lead.leadStatus || 'ใหม่',
  sale_status: lead.saleStatus || 'สนใจรถ',
  payout_status: lead.payoutStatus || 'ยังไม่เกิดสิทธิ์',
  commission_amount: Number(lead.commissionAmount || 0),
  notes: lead.notes || null,
  updated_at: new Date().toISOString(),
});

// -----------------------------------------------------------------------------
// CARS SERVICE
// -----------------------------------------------------------------------------
export const dbFetchCars = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('clubrod_cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        if (data.length === 0) {
          // Seed initial cars if database table is newly created
          await dbSeedInitialData();
          return initialCars;
        }
        return data.map(mapCarFromDb);
      }
    } catch (e) {
      console.warn('Supabase clubrod_cars fetch failed, falling back to local storage', e);
    }
  }
  return getStorage(KEYS.CARS, initialCars);
};

export const dbUpsertCar = async (car) => {
  if (isSupabaseConfigured()) {
    try {
      const payload = mapCarToDb(car);
      const { error } = await supabase.from('clubrod_cars').upsert(payload);
      if (error) throw error;
    } catch (e) {
      console.warn('dbUpsertCar Supabase error', e);
    }
  }
};

export const dbDeleteCar = async (carId) => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('clubrod_cars').delete().eq('id', carId);
      if (error) throw error;
    } catch (e) {
      console.warn('dbDeleteCar Supabase error', e);
    }
  }
};

// -----------------------------------------------------------------------------
// AGENTS SERVICE
// -----------------------------------------------------------------------------
export const dbFetchAgents = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('clubrod_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapAgentFromDb);
      }
    } catch (e) {
      console.warn('Supabase clubrod_agents fetch failed', e);
    }
  }
  return getStorage(KEYS.AGENTS, initialAgents);
};

export const dbUpsertAgent = async (agent) => {
  if (isSupabaseConfigured()) {
    try {
      const payload = mapAgentToDb(agent);
      const { error } = await supabase.from('clubrod_agents').upsert(payload);
      if (error) throw error;
    } catch (e) {
      console.warn('dbUpsertAgent Supabase error', e);
    }
  }
};

// -----------------------------------------------------------------------------
// ADVERTISERS SERVICE
// -----------------------------------------------------------------------------
export const dbFetchAdvertisers = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('clubrod_advertisers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapAdvertiserFromDb);
      }
    } catch (e) {
      console.warn('Supabase clubrod_advertisers fetch failed', e);
    }
  }
  return getStorage(KEYS.ADVERTISERS, initialAdvertisers);
};

export const dbUpsertAdvertiser = async (advertiser) => {
  if (isSupabaseConfigured()) {
    try {
      const payload = mapAdvertiserToDb(advertiser);
      const { error } = await supabase.from('clubrod_advertisers').upsert(payload);
      if (error) throw error;
    } catch (e) {
      console.warn('dbUpsertAdvertiser Supabase error', e);
    }
  }
};

// -----------------------------------------------------------------------------
// LEADS SERVICE
// -----------------------------------------------------------------------------
export const dbFetchLeads = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('clubrod_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapLeadFromDb);
      }
    } catch (e) {
      console.warn('Supabase clubrod_leads fetch failed', e);
    }
  }
  return getStorage(KEYS.LEADS, initialLeads);
};

export const dbInsertLead = async (lead) => {
  if (isSupabaseConfigured()) {
    try {
      const payload = mapLeadToDb(lead);
      const { error } = await supabase.from('clubrod_leads').insert([payload]);
      if (error) throw error;
    } catch (e) {
      console.warn('dbInsertLead Supabase error', e);
    }
  }
};

export const dbUpdateLead = async (leadId, fields) => {
  if (isSupabaseConfigured()) {
    try {
      const dbFields = {};
      if ('leadStatus' in fields) dbFields.lead_status = fields.leadStatus;
      if ('saleStatus' in fields) dbFields.sale_status = fields.saleStatus;
      if ('payoutStatus' in fields) dbFields.payout_status = fields.payoutStatus;
      if ('notes' in fields) dbFields.notes = fields.notes;
      dbFields.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('clubrod_leads')
        .update(dbFields)
        .eq('id', leadId);
      if (error) throw error;
    } catch (e) {
      console.warn('dbUpdateLead Supabase error', e);
    }
  }
};

// -----------------------------------------------------------------------------
// MASTER CAR FEATURES SERVICE
// -----------------------------------------------------------------------------
export const dbFetchCarFeatures = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('clubrod_car_features')
        .select('*')
        .order('category', { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Supabase clubrod_car_features fetch failed', e);
    }
  }
  return getStorage(KEYS.CAR_FEATURES, DEFAULT_CAR_FEATURES);
};

// -----------------------------------------------------------------------------
// SEED INITIAL DATA (When database is fresh)
// -----------------------------------------------------------------------------
export const dbSeedInitialData = async () => {
  if (!isSupabaseConfigured()) return;
  try {
    // Seed Advertisers
    for (const adv of initialAdvertisers) {
      await supabase.from('clubrod_advertisers').upsert(mapAdvertiserToDb(adv));
    }
    // Seed Agents
    for (const ag of initialAgents) {
      await supabase.from('clubrod_agents').upsert(mapAgentToDb(ag));
    }
    // Seed Cars
    for (const car of initialCars) {
      await supabase.from('clubrod_cars').upsert(mapCarToDb(car));
    }
    // Seed Leads
    for (const lead of initialLeads) {
      await supabase.from('clubrod_leads').upsert(mapLeadToDb(lead));
    }
  } catch (err) {
    console.warn('Error during dbSeedInitialData:', err);
  }
};
