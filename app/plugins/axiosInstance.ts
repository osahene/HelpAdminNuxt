// plugins/axios.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosInstance } from 'axios';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import { defineNuxtPlugin, useRuntimeConfig, useRouter, useCookie } from '#app';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface DecodedToken {
  exp: number;
  [key: string]: unknown;
}

// ----------------------------------------------------------------------
// UI Helpers
// ----------------------------------------------------------------------
const showLoading = () => {
  console.log('[Loading] show');
};

const hideLoading = () => {
  console.log('[Loading] hide');
};

const showErrorNotification = (message: string) => {
  console.error('[Notification]', message);
};

// ----------------------------------------------------------------------
// Plugin definition
// ----------------------------------------------------------------------
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const router = useRouter();
  const baseURL = config.public.baseURL as string | undefined;

  // 1. Initialize our cookies right at the top of the plugin
  // These will work seamlessly on both Server (SSR) and Client (Browser)
  const accessTokenCookie = useCookie<string | null>('accessToken', { default: () => null });
  const refreshTokenCookie = useCookie<string | null>('refreshToken', { default: () => null });
  const lastActiveCookie = useCookie<string | null>('lastActive', { default: () => null });

  // Create Axios instance
  const $axios = axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // ----------------------------------------------------------------
  // Refresh token logic (moved inside to access cookies easily)
  // ----------------------------------------------------------------
  const takeRefreshToken = async () => {
    const refreshToken = refreshTokenCookie.value;
    if (!refreshToken) return null;

    try {
      const response = await $axios.post(
        `${baseURL ?? ''}/trap_admin/token/refresh/`,
        { refresh: refreshToken }
      );

      const { access, refresh } = response.data;
      if (access) {
        $axios.defaults.headers.common.Authorization = `Bearer ${access}`;
        
        // Save to cookies instead of localStorage
        accessTokenCookie.value = access;
        if (refresh) {
          refreshTokenCookie.value = refresh;
        }
        return { accessToken: access, refreshToken: refresh || refreshToken };
      }
      return null;
    } catch (error) {
      let errorMessage = 'Error refreshing token';
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      showErrorNotification(errorMessage);
      return null;
    }
  };

  // ----------------------------------------------------------------
  // Activity tracking (client-only)
  // ----------------------------------------------------------------
  let userIsActive = true;

  const setUserActive = () => {
    userIsActive = true;
    if (process.client) {
      lastActiveCookie.value = new Date().toISOString();
    }
  };

  if (process.client) {
    window.addEventListener('mousemove', setUserActive);
    window.addEventListener('keydown', setUserActive);
    window.addEventListener('scroll', setUserActive);
  }

  // ----------------------------------------------------------------
  // Token refresh scheduler
  // ----------------------------------------------------------------
  const scheduleTokenRefresh = () => {
    setInterval(async () => {
      const accessToken = accessTokenCookie.value;
      const refreshToken = refreshTokenCookie.value;

      if (!accessToken || !refreshToken) return;

      try {
        const decodedAccess = jwtDecode<DecodedToken>(accessToken);
        const decodedRefresh = jwtDecode<DecodedToken>(refreshToken);
        const now = dayjs();
        const accessExp = dayjs.unix(decodedAccess.exp);
        const refreshExp = dayjs.unix(decodedRefresh.exp);

        if (accessExp.diff(now, 'minute') <= 1 && userIsActive) {
          await takeRefreshToken();
        }

        if (refreshExp.diff(now, 'minute') <= 1 && userIsActive) {
          await takeRefreshToken();
        }

        // Auto logout if refresh token expires while user inactive
        const lastActiveDate = lastActiveCookie.value ? dayjs(lastActiveCookie.value) : dayjs();
        if (
          now.diff(lastActiveDate, 'minute') >= 10 &&
          refreshExp.diff(now, 'minute') <= 1
        ) {
          accessTokenCookie.value = null;
          refreshTokenCookie.value = null;
          userIsActive = false;
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Token refresh scheduler error:', error);
      }
    }, 30000); 
  };

  if (process.client) {
    scheduleTokenRefresh();
  }

  // ----------------------------------------------------------------
  // Request interceptor: add auth header & show loading
  // ----------------------------------------------------------------
  $axios.interceptors.request.use(async (req: InternalAxiosRequestConfig) => {
    showLoading();

    // Safely read from the cookie instead of localStorage
    let accessToken = accessTokenCookie.value;
    
    if (accessToken) {
      const decoded = jwtDecode<DecodedToken>(accessToken);
      const isExpired = dayjs.unix(decoded.exp).diff(dayjs()) < 1;

      if (!isExpired) {
        req.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        const tokens = await takeRefreshToken();
        if (tokens?.accessToken) {
          req.headers.Authorization = `Bearer ${tokens.accessToken}`;
        } else {
          accessTokenCookie.value = null;
          refreshTokenCookie.value = null;
          router.push('/auth/login');
        }
      }
    }
    return req;
  });

  // ----------------------------------------------------------------
  // Response interceptor: hide loading & handle errors
  // ----------------------------------------------------------------
  $axios.interceptors.response.use(
    (response) => {
      hideLoading();
      return response;
    },
    (error: AxiosError) => {
      hideLoading();
      return Promise.reject(error);
    }
  );

  return {
    provide: {
      axios: $axios,
    },
  };
});