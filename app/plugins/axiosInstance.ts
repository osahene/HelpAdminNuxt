// plugins/axios.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosInstance } from 'axios';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#app';

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
// UI Helpers (replace with your actual UI logic)
// ----------------------------------------------------------------------
const showLoading = () => {
  // TODO: implement loading overlay
  console.log('[Loading] show');
};

const hideLoading = () => {
  // TODO: hide loading overlay
  console.log('[Loading] hide');
};

const showErrorNotification = (message: string) => {
  // TODO: show error toast/notification
  console.error('[Notification]', message);
};

// ----------------------------------------------------------------------
// Refresh token logic
// ----------------------------------------------------------------------
const takeRefreshToken = async (axiosInstance: AxiosInstance, baseURL?: string) => {
  const urlBase = baseURL ?? '';
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await axiosInstance.post(
      `${urlBase}account/token/refresh/`,
      { refresh: refreshToken }
    );

    const { access, refresh } = response.data;
    if (access) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${access}`;
      localStorage.setItem('accessToken', access);
      if (refresh) {
        localStorage.setItem('refreshToken', refresh);
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

// ----------------------------------------------------------------------
// Plugin definition
// ----------------------------------------------------------------------
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const router = useRouter();
  // set in nuxt.config.ts
  const baseURL = config.public.baseURL as string | undefined;

  // Create Axios instance
  const $axios = axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // ----------------------------------------------------------------
  // Activity tracking (client‑only)
  // ----------------------------------------------------------------
  let userIsActive = true;

  const setUserActive = () => {
    userIsActive = true;
    localStorage.setItem('lastActive', new Date().toISOString());
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
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) return;

      try {
        const decodedAccess = jwtDecode<DecodedToken>(accessToken);
        const decodedRefresh = jwtDecode<DecodedToken>(refreshToken);
        const now = dayjs();
        const accessExp = dayjs.unix(decodedAccess.exp);
        const refreshExp = dayjs.unix(decodedRefresh.exp);

        // Refresh access token if expiring soon and user is active
          if (accessExp.diff(now, 'minute') <= 1 && userIsActive) {
            await takeRefreshToken($axios, baseURL ?? '');
        }

        // Refresh refresh token if expiring soon and user is active
        if (refreshExp.diff(now, 'minute') <= 1 && userIsActive) {
          await takeRefreshToken($axios, baseURL ?? '');
        }

        // Auto logout if refresh token expires while user inactive for 10+ minutes
        const lastActive = dayjs(localStorage.getItem('lastActive'));
        if (
          now.diff(lastActive, 'minute') >= 10 &&
          refreshExp.diff(now, 'minute') <= 1
        ) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          userIsActive = false;
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Token refresh scheduler error:', error);
      }
    }, 30000); // check every 30 seconds
  };

  if (process.client) {
    scheduleTokenRefresh();
  }

  // ----------------------------------------------------------------
  // Request interceptor: add auth header & show loading
  // ----------------------------------------------------------------
  $axios.interceptors.request.use(async (req: InternalAxiosRequestConfig) => {
    showLoading();

    let accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const decoded = jwtDecode<DecodedToken>(accessToken);
      const isExpired = dayjs.unix(decoded.exp).diff(dayjs()) < 1;

      if (!isExpired) {
        req.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        const tokens = await takeRefreshToken($axios, baseURL);
        if (tokens?.accessToken) {
          req.headers.Authorization = `Bearer ${tokens.accessToken}`;
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
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
      // Optional: handle global errors (e.g., 401, 403)
      return Promise.reject(error);
    }
  );

  // Provide the axios instance to the app
  return {
    provide: {
      axios: $axios,
    },
  };
});