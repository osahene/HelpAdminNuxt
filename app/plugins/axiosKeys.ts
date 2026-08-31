// plugins/apiService.ts
import { defineNuxtPlugin } from '#app';
import type { AxiosInstance } from 'axios';

export default defineNuxtPlugin((nuxtApp) => {
  // Get the Axios instance provided by axiosInstance.ts
  const $axios = nuxtApp.$axios as AxiosInstance;

  const apiService = {
    register: (data: any) => $axios.post("/trap_admin/register/", data),
    login: (data: any) => $axios.post("/trap_admin/login/", data),
    logout: (data: any) => $axios.post("/trap_admin/logout/", data),
    verifyEmail: (data: any) => $axios.post("/trap_admin/verify-email/", data),
    verifyPin: (data: any) => $axios.post("/trap_admin/verify-pin/", data),
    resendPin: (data: any) => $axios.post("/trap_admin/resend-pin/", data),
    forgotPassword: (data: { email: string }) => $axios.post("/trap_admin/forgot-password/", data),
    resetPassword: (data: { uid: string; token: string; password: string; confirm_password: string }) =>
      $axios.post("/trap_admin/reset-password/", data),
    me: () => $axios.get("/trap_admin/me/"),
    dashboardData: () => $axios.get("/trap_admin/dashboard/"),
    users: (data: any) => $axios.get("/trap_admin/users/", data),
    usersId: (id: string) => $axios.get(`/trap_admin/users/${id}/`),
    usersIdContacts: (id: string) => $axios.get(`/trap_admin/users/${id}/contacts/`),
    usersIdAlerts: (id: string) => $axios.get(`/trap_admin/users/${id}/alerts/`),
    usersIdRemindContacts: (id: string) => $axios.post(`/trap_admin/users/${id}/remind-contacts/`),
    contacts: (data: any) => $axios.get("/trap_admin/contacts/", data),
    contactsId: (id: string) => $axios.get(`/trap_admin/contacts/${id}/`),
    contactNotifications: (id: string) => $axios.get(`/trap_admin/contacts/${id}/notifications/`),
    inviteContact: (id: string) => $axios.post(`/trap_admin/contacts/${id}/invite/`),
    resendInvite: (id: string) => $axios.post(`/trap_admin/contacts/${id}/resend-invite/`),
    alerts: (data: any) => $axios.get("/trap_admin/alerts/", data),
    alertsId: (id: string) => $axios.get(`/trap_admin/alerts/${id}/`),
    alertsIdStatus: (id: string, status: string) => $axios.patch(`/trap_admin/alerts/${id}/status/`, { status }),
    alertsResponseTime: (id: string, data: any) => $axios.patch(`/trap_admin/alerts/${id}/response-time/`, data),
    alertsActive: () => $axios.get("/alerts/active/"),
    alertsExport: (data: any) => $axios.post("/trap_admin/alerts/export/", data, { responseType: 'blob' }),
    analytics: (data?: any) => $axios.get("/trap_admin/analytics/", data),
    reportsGenerate: (data: any) => $axios.post("/trap_admin/reports/generate/", data),
    reports: () => $axios.get("/trap_admin/reports/"),
    reportsDownload: (id: string) => $axios.get(`/trap_admin/reports/${id}/`, { responseType: 'blob' }),
    reportsDelete: (id: string) => $axios.delete(`/trap_admin/reports/${id}/`),
    campaigns: (data: any, config?: any) => $axios.post("/trap_admin/campaigns/", data, config),
    campaignsList: (params?: any) => $axios.get("/trap_admin/campaigns/", { params }),
    campaignsId: (id: string) => $axios.get(`/trap_admin/campaigns/${id}/`),
    campaignsResend: (id: string) => $axios.post(`/trap_admin/campaigns/${id}/resend/`),
    campaignsExport: (id: string) => $axios.get(`/trap_admin/campaigns/${id}/export/`, { responseType: 'blob' }),
    campaignsPreview: (recipientType: string, filters?: Record<string, string>) =>
      $axios.get('/trap_admin/campaigns/preview/', { params: { recipientType, ...filters } }),
    campaignsLocationOptions: (level: string, parents?: Record<string, string>) =>
      $axios.get('/trap_admin/campaigns/location-options/', { params: { level, ...parents } }),
    settings: () => $axios.get("/trap_admin/settings/"),
    settingsGeneral: (data: any) => $axios.put("/trap_admin/settings/general/", data),
    settingsTemplates: (data: any) => $axios.put("/trap_admin/settings/templates/", data),
    settingsIntegrations: (data: any) => $axios.put("/trap_admin/settings/integrations/", data),
    settingsPrivacy: (data: any) => $axios.put("/trap_admin/settings/privacy/", data),
  };

  // Provide the API service to the app
  return {
    provide: {
      api: apiService,
    },
  };
});