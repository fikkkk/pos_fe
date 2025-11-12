import api from '../lib/api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  if (res.data?.access_token) {
    localStorage.setItem('access_token', res.data.access_token);
    if (res.data?.user) localStorage.setItem('user', JSON.stringify(res.data.user));
  }
  return res.data;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}
