const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export const WS_URL =
  process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

export const API_ORIGIN = trimTrailingSlash(
  API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL
);
