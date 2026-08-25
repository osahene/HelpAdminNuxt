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
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  // ----------------------------------------------------------------
  // Refresh token logic (moved inside to access cookies easily)
  // ----------------------------------------------------------------
    const refreshClient = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  let refreshRequest: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

  const takeRefreshToken = async () => {
    const refreshToken = refreshTokenCookie.value;
    if (!refreshToken) return null;
    if (refreshRequest) return refreshRequest;

     refreshRequest = (async () => {
    try {
      const response = await refreshClient.post(
        `${baseURL ?? ''}/trap_admin/token/refresh/`,
        { refresh: refreshToken }
      );

      // AdminTokenRefreshView (main_admin) returns the access JWT under
      // `token`, matching AdminLoginView's response shape — not the
      // `access` key stock SimpleJWT's TokenRefreshView uses.
      const { token: access, refresh } = response.data;
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
      console.error('Token refresh failed:', error);
      return null;
      }
    })();

    try {
      return await refreshRequest;
    } finally {
      refreshRequest = null;
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
          // Don't router.push() here: this interceptor runs during SSR too,
          // and pushing a navigation re-enters auth.global.ts mid-request
          // (isHydrated isn't set yet), which re-triggers fetchUser() and
          // this same interceptor again — an unbounded loop within one
          // request. Clearing the tokens is enough; auth.global.ts already
          // redirects unauthenticated users on the next route evaluation.
          accessTokenCookie.value = null;
          refreshTokenCookie.value = null;
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