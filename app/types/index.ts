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
  type: 'robbery' | 'health' | 'fire' | 'flood' | 'violence'
  action?: string             // Handled directly inside backend views
  status: 'active' | 'resolved' | 'false_alarm'
  userId?: string
  user?: {
    id: string
    name: string
    phone: string
    email: string
  }
  location?: {
    coordinates?: { lat: number; lng: number }
    address: string
  }
  agency_notified_at?: string
  agency_arrived_at?: string
  resolved_at?: string
  created_at: string
  contacts_notified_details?: AlertContactDetail[]
}