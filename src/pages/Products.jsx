import { useEffect, useState } from 'react';
import { getProducts } from '../services/products';

export default function Products() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getProducts().then(setItems).catch((e)=>{
      setErr(e?.response?.data?.message ?? 'Gagal memuat produk');
    });
  }, []);

  if (err) return <p style={{color:'red'}}>{err}</p>;
  return <pre style={{ padding: 16 }}>{JSON.stringify(items, null, 2)}</pre>;
}
