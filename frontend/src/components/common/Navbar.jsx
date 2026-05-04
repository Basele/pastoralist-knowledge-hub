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

  const navLinks = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/knowledge', label: t('nav.knowledge') },
    { to: '/map', label: t('nav.map') },
    { to: '/community', label: t('nav.community') },
    ...(isAuthenticated ? [{ to: '/contribute', label: t('nav.contribute') }] : []),
    ...(isAuthenticated && ['ADMIN','SUPER_ADMIN','ELDER_CUSTODIAN'].includes(user?.role)
      ? [{ to: '/admin', label: t('nav.admin') }] : []),
  ];

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #EDE4D3', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: '#3A700D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.125rem' }}>P</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#1A1008', fontSize: '1.125rem' }}>PIK Hub</span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {navLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
                fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                color: isActive ? '#3A700D' : '#6E5528',
                borderBottom: isActive ? '2px solid #3A700D' : '2px solid transparent',
                paddingBottom: '0.125rem',
              })}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={toggleLang} style={{ fontSize: '0.75rem', fontWeight: 500, padding: '0.375rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #D9C9A8', color: '#6E5528', background: 'white', cursor: 'pointer' }}>
              {i18n.language === 'en' ? 'SW' : 'EN'}
            </button>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#D9EBB8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D5616', fontWeight: 500, fontSize: '0.875rem' }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                </Link>
                <button onClick={handleLogout} style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #EDE4D3', background: 'white', color: '#6E5528', cursor: 'pointer' }}>
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/login" style={{ fontSize: '0.875rem', color: '#6E5528', textDecoration: 'none', padding: '0.375rem 0.75rem' }}>{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.375rem 1rem' }}>{t('nav.register')}</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ paddingBottom: '1rem', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid #EDE4D3' }}>
            {navLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  padding: '0.625rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500,
                  textDecoration: 'none', color: isActive ? '#2D5616' : '#523D1C',
                  background: isActive ? '#D9EBB8' : 'transparent',
                })}>
                {label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                style={{ padding: '0.625rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#C44420', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: '0.5rem' }}>
                {t('nav.logout')}
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
