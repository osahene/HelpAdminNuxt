export interface User {
id: string
  email: string
  first_name: string
  last_name: string
  name: string            // Provided by get_full_name / serializer method field
  phone_number: string    // Mapped from backend model schema
  is_active: boolean
  role?: string
  created_at: string      // Mapped from backend models
  contact_count?: number
  contacts?: Contact[]
  alerts?: Alert[]
}

export interface DashboardStats {
  activeAlerts: number
  avgResponseTime: number
  totalUsers: number
  avgContactsPerUser: number
}

export interface ActiveAlertsResponse {
  activeAlerts: Alert[]
}

export interface DashboardResponse {
  stats: DashboardStats
  alertsByType: { type: string; count: number }[]
  responseTimeTrend: { date: string; value: number }[]
  userGrowth: { month: string; count: number }[]
  recentAlerts: Alert[]
}

export interface ContactsState {
  contacts: Contact[]
  selectedContact: Contact | null
  pagination: {
    currentPage: number
    totalPages: number
    total: number
    perPage: number
  }
  loading: boolean
}

export interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  isUser: boolean
  status: 'pending' | 'approved' | 'rejected'
 userId: string
  user?: { name: string }
  createdAt: string
}

export interface AlertContactDetail {
  id: string
  name: string
  phone: string
  notificationStatus: string  // Maps from code base definitions fallback
  verifiedAt: string | null
  token?: string
}

export interface Alert {
  id: string
  type: 'Robbery Attack' | 'Health Crisis' | 'Fire Outbreak' | 'Flood Alert' | 'Violence Alert' | 'Call Emergency'
  action?: string             // Handled directly inside backend views
  status: 'active' | 'resolved' | 'false_alarm'
  userId?: string
  user?: {
    id: string
    name: string
    phone: string
    email: string
  }
  location?:{ latitude: number; 
    longitude: number; 
    address: string 
  }   
  
  agency_notified_at?: string
  agency_arrived_at?: string
  resolved_at?: string
  created_at: string
  contacts_notified_details?: AlertContactDetail[]
}

// One row of a DeliveryTimingTable — a "from" event vs a "to" event, with
// the duration between them computed client-side.
export interface TimingRow {
  id: string
  subject: string
  meta?: string | null
  from: string
  to: string | null
  status: string
}