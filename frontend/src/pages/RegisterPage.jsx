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
      toast.success('Account created! Welcome to the hub.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-savanna-600 flex items-center justify-center text-white font-display font-bold text-2xl mx-auto mb-4">P</div>
          <h1 className="font-display text-3xl font-bold text-earth-900">{t('auth.register_title')}</h1>
          <p className="text-earth-500 mt-2">{t('auth.register_subtitle')}</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">{t('auth.name')}</label>
              <input type="text" required className="input" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">{t('auth.email')}</label>
              <input type="email" required className="input" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">{t('auth.password')}</label>
              <input type="password" required minLength={8} className="input" value={form.password} onChange={set('password')} />
              <p className="text-xs text-earth-400 mt-1">Minimum 8 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">{t('auth.community')}</label>
              <select className="input" value={form.communityId} onChange={set('communityId')}>
                <option value="">Select your community...</option>
                {communities?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? '...' : t('auth.register_btn')}
            </button>
          </form>
          <p className="text-center text-sm text-earth-500 mt-6">
            {t('auth.has_account')}{' '}
            <Link to="/login" className="text-savanna-600 font-medium hover:underline">{t('nav.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
