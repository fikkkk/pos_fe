import { useState } from 'react';
import { login } from '../services/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      await login(email, password);
      window.location.href = '/products';
    } catch (e) {
      setErr(e?.response?.data?.message ?? 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360, margin: '48px auto' }}>
      <h3>Login</h3>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {err && <p style={{color:'red'}}>{err}</p>}
      <button disabled={loading}>{loading ? '...' : 'Masuk'}</button>
    </form>
  );
}
