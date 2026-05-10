import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { communityApi } from '../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', communityId: '' });
  const [loading, setLoading] = useState(false);

  const { data: communities } = useQuery({
    queryKey: ['communities'],
    queryFn: () => communityApi.list().then(r => r.data),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, communityId: form.communityId || undefined });
      toast.success('Welcome to the hub!');
      navigate('/');
    } catch (err) {
      toast.error(err.response && err.response.data && err.response.data.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#523D1C', marginBottom: '0.375rem' };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: '#3A700D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.5rem', margin: '0 auto 1rem' }}>P</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', fontWeight: 700, color: '#1A1008' }}>{t('auth.register_title')}</h1>
          <p style={{ color: '#8B6F35', marginTop: '0.5rem' }}>{t('auth.register_subtitle')}</p>
        </div>
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>{t('auth.name')}</label>
              <input type="text" required className="input" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label style={labelStyle}>{t('auth.email')}</label>
              <input type="email" required className="input" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label style={labelStyle}>{t('auth.password')}</label>
              <input type="password" required minLength={8} className="input" value={form.password} onChange={set('password')} />
              <p style={{ fontSize: '0.75rem', color: '#A88B50', marginTop: '0.25rem' }}>Minimum 8 characters</p>
            </div>
            <div>
              <label style={labelStyle}>{t('auth.community')}</label>
              <select className="input" value={form.communityId} onChange={set('communityId')}>
                <option value="">Select your community...</option>
                {communities && communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              {loading ? 'Creating account...' : t('auth.register_btn')}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#8B6F35', marginTop: '1.5rem' }}>
            {t('auth.has_account')}{' '}
            <Link to="/login" style={{ color: '#3A700D', fontWeight: 500, textDecoration: 'none' }}>{t('nav.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
