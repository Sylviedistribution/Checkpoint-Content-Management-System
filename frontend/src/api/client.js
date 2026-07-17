import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1' });

// Attache le JWT a chaque requete
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('educms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Renouvellement automatique du token expire
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('educms_refresh');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
          localStorage.setItem('educms_token', data.data.accessToken);
          localStorage.setItem('educms_refresh', data.data.refreshToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
