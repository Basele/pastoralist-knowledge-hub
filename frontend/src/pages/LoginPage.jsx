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
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-savanna-600 flex items-center justify-center text-white font-display font-bold text-2xl mx-auto mb-4">P</div>
          <h1 className="font-display text-3xl font-bold text-earth-900">{t('auth.login_title')}</h1>
          <p className="text-earth-500 mt-2">{t('auth.login_subtitle')}</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">{t('auth.email')}</label>
              <input type="email" required className="input" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">{t('auth.password')}</label>
              <input type="password" required className="input" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? '...' : t('auth.login_btn')}
            </button>
          </form>
          <p className="text-center text-sm text-earth-500 mt-6">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-savanna-600 font-medium hover:underline">{t('nav.register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
