export interface User {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
  contactCount: number
  contacts: Contact[]
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

export interface Alert {
  id: string
  type: 'robbery' | 'health' | 'fire' | 'flood' | 'violence'
  userId: string
  user?: User
  location?: {
    coordinates: { lat: number; lng: number }
    address: string
  }
  createdAt: string
  agencyNotifiedAt?: string
  agencyArrivedAt?: string
  contactsNotified: string[]
  status: 'active' | 'resolved' | 'false_alarm'
}