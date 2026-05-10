import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response && err.response.data && err.response.data.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: '#3A700D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.5rem', margin: '0 auto 1rem' }}>P</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', fontWeight: 700, color: '#1A1008' }}>{t('auth.login_title')}</h1>
          <p style={{ color: '#8B6F35', marginTop: '0.5rem' }}>{t('auth.login_subtitle')}</p>
        </div>
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#523D1C', marginBottom: '0.375rem' }}>{t('auth.email')}</label>
              <input type="email" required className="input" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#523D1C', marginBottom: '0.375rem' }}>{t('auth.password')}</label>
              <input type="password" required className="input" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              {loading ? 'Signing in...' : t('auth.login_btn')}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#8B6F35', marginTop: '1.5rem' }}>
            {t('auth.no_account')}{' '}
            <Link to="/register" style={{ color: '#3A700D', fontWeight: 500, textDecoration: 'none' }}>{t('nav.register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
