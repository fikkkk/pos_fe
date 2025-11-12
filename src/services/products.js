import api from '../lib/api';

export async function getProducts() {
  const res = await api.get('/products'); // contoh endpoint proteksi
  return res.data;
}
