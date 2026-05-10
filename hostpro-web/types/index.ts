export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_superadmin: boolean;
  created_at: string;
  tenants?: TenantMini[];
}

export interface TenantMini {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export interface Property {
  id: string;
  tenant_id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  property_type: string;
  status: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  surface_m2: number | null;
  min_stay_nights: number;
  max_stay_nights: number | null;
  check_in_time: string;
  check_out_time: string;
  base_price_night: number | null;
  cleaning_fee: number;
  security_deposit: number;
  amenities: string[];
  house_rules: string[];
  photos: PropertyPhoto[];
  created_at: string;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  caption: string | null;
  position: number;
  is_cover: boolean;
}

export interface Guest {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  created_at: string;
}

export interface Reservation {
  id: string;
  tenant_id: string;
  property_id: string;
  guest_id: string | null;
  source: string;
  source_ref_id: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  status: string;
  total_amount: number | null;
  cleaning_fee: number | null;
  net_revenue: number | null;
  payment_status: string;
  adults: number;
  children: number;
  notes_internal: string | null;
  notes_guest: string | null;
  check_in_done: boolean;
  check_out_done: boolean;
  guest: Guest | null;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  property_id: string;
  reservation_id: string | null;
  event_type: string;
  start_date: string;
  end_date: string;
  title: string | null;
  color: string | null;
  source: string;
}

export interface Task {
  id: string;
  tenant_id: string;
  property_id: string | null;
  reservation_id: string | null;
  task_type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  due_time: string | null;
  assigned_to: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface ComplianceRecord {
  id: string;
  tenant_id: string;
  property_id: string;
  registration_number: string | null;
  registration_city: string | null;
  registration_expiry: string | null;
  nuitees_year: number;
  nuitees_limit: number;
  nuitees_alert_at: number;
  current_year: number | null;
  dpe_class: string | null;
  dpe_expiry: string | null;
  fiscal_regime: string | null;
  siret: string | null;
  is_compliant: boolean;
  alerts: string[];
  last_checked_at: string | null;
}

export interface KPIs {
  occupancy_rate: number;
  total_revenue: number;
  adr: number;
  revpar: number;
  total_reservations: number;
  active_properties: number;
  period: string;
}

export interface MessageThread {
  id: string;
  property_id: string | null;
  reservation_id: string | null;
  guest_id: string | null;
  channel: string;
  status: string;
  last_message_at: string | null;
  messages: Message[];
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  direction: string;
  content: string;
  is_automated: boolean;
  sent_at: string | null;
  read_at: string | null;
  created_at: string | null;
}
