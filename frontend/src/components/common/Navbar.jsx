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
    ...(isAuthenticated && ['ADMIN','SUPER_ADMIN','ELDER_CUSTODIAN'].includes(user && user.role)
      ? [{ to: '/admin', label: t('nav.admin') }] : []),
  ];

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #EDE4D3', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: '#3A700D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.125rem', flexShrink: 0 }}>P</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#1A1008', fontSize: '1.125rem', whiteSpace: 'nowrap' }}>PIK Hub</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'nowrap' }}>
            {navLinks.map(function(item) {
              return (
                <NavLink key={item.to} to={item.to} end={item.end} style={function(p) { return {
                  fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap',
                  color: p.isActive ? '#3A700D' : '#6E5528',
                  borderBottom: p.isActive ? '2px solid #3A700D' : '2px solid transparent',
                  paddingBottom: '0.125rem',
                }; }}>
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <button onClick={toggleLang} style={{ fontSize: '0.75rem', fontWeight: 500, padding: '0.375rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #D9C9A8', color: '#6E5528', background: 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {i18n.language === 'en' ? 'SW' : 'EN'}
            </button>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#D9EBB8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D5616', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>
                    {user && user.name && user.name[0].toUpperCase()}
                  </div>
                </Link>
                <button onClick={handleLogout} style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #EDE4D3', background: 'white', color: '#6E5528', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/login" style={{ fontSize: '0.875rem', color: '#6E5528', textDecoration: 'none', padding: '0.375rem 0.75rem', whiteSpace: 'nowrap' }}>{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.375rem 1rem' }}>{t('nav.register')}</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}