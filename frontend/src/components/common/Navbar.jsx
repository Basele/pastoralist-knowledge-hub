import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import i18n from '../../i18n/i18n';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'sw' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('pikh-lang', next);
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-savanna-600 border-b-2 border-savanna-600' : 'text-earth-600 hover:text-earth-900'}`;

  return (
    <nav className="bg-white border-b border-earth-100 sticky top-0 z-50">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-savanna-600 flex items-center justify-center text-white font-display font-bold text-lg">P</div>
            <span className="font-display font-semibold text-earth-900 text-lg hidden sm:block">
              PIK Hub
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={linkClass}>{t('nav.home')}</NavLink>
            <NavLink to="/knowledge" className={linkClass}>{t('nav.knowledge')}</NavLink>
            <NavLink to="/map" className={linkClass}>{t('nav.map')}</NavLink>
            <NavLink to="/community" className={linkClass}>{t('nav.community')}</NavLink>
            {isAuthenticated && <NavLink to="/contribute" className={linkClass}>{t('nav.contribute')}</NavLink>}
            {isAuthenticated && ['ADMIN','SUPER_ADMIN','ELDER_CUSTODIAN'].includes(user?.role) && (
              <NavLink to="/admin" className={linkClass}>{t('nav.admin')}</NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button onClick={toggleLang} className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-earth-200 text-earth-600 hover:bg-earth-50 transition-colors">
              {i18n.language === 'en' ? 'SW' : 'EN'}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-savanna-100 flex items-center justify-center text-savanna-700 font-medium text-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-xs py-1.5 px-3 hidden sm:flex">
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-1.5 px-3">{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">{t('nav.register')}</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-earth-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 flex flex-col gap-1 border-t border-earth-100 mt-1">
            {[
              { to: '/', label: t('nav.home'), end: true },
              { to: '/knowledge', label: t('nav.knowledge') },
              { to: '/map', label: t('nav.map') },
              { to: '/community', label: t('nav.community') },
              ...(isAuthenticated ? [{ to: '/contribute', label: t('nav.contribute') }] : []),
            ].map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-savanna-50 text-savanna-700' : 'text-earth-700 hover:bg-earth-50'}`}>
                {label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-clay-600 hover:bg-clay-50 text-left mt-2">
                {t('nav.logout')}
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
