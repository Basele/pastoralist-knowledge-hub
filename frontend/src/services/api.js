import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach stored token on startup
const stored = JSON.parse(localStorage.getItem('pikh-auth') || '{}');
if (stored?.state?.accessToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${stored.state.accessToken}`;
}

// Response interceptor â€” auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { useAuthStore } = await import('../store/authStore');
        const newToken = await useAuthStore.getState().refreshAccessToken();
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch {
        const { useAuthStore } = await import('../store/authStore');
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Convenience methods
export const knowledgeApi = {
  list: (params) => api.get('/knowledge', { params }),
  get: (id) => api.get(`/knowledge/${id}`),
  create: (data) => api.post('/knowledge', data),
  update: (id, data) => api.patch(`/knowledge/${id}`, data),
  remove: (id) => api.delete(`/knowledge/${id}`),
  review: (id, data) => api.patch(`/knowledge/${id}/review`, data),
};

export const locationApi = {
  list: (params) => api.get('/locations', { params }),
  geojson: (params) => api.get('/locations/geojson', { params }),
  get: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
};

export const communityApi = {
  create: (data) => api.post('/communities', data),
  update: (id, data) => api.patch(/communities/+id, data),
  create: (data) => api.post('/communities', data),
  update: (id, data) => api.patch(/communities/+id, data),
  list: () => api.get('/communities'),
  get: (id) => api.get(`/communities/${id}`),
};

export const searchApi = {
  search: (params) => api.get('/search', { params }),
};

export const mediaApi = {
  upload: (formData, onProgress) => api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
  }),
  remove: (id) => api.delete(`/media/${id}`),
};


