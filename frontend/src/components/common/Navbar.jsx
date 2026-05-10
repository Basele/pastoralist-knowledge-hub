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
    setMenuOpen(false);
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

  const activeLinkStyle = { color: '#3A700D', borderBottom: '2px solid #3A700D', paddingBottom: '0.125rem' };
  const inactiveLinkStyle = { color: '#6E5528', borderBottom: '2px solid transparent', paddingBottom: '0.125rem' };

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #EDE4D3', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: '#3A700D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.125rem' }}>P</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#1A1008', fontSize: '1.125rem', whiteSpace: 'nowrap' }}>PIK Hub</span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, justifyContent: 'center' }}
            className="desktop-nav">
            {navLinks.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end}
                style={({ isActive }) => ({ fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', ...(isActive ? activeLinkStyle : inactiveLinkStyle) })}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <button onClick={toggleLang}
              style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #D9C9A8', color: '#6E5528', background: 'white', cursor: 'pointer' }}>
              {i18n.language === 'en' ? 'SW' : 'EN'}
            </button>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#D9EBB8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D5616', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                    {user && user.name && user.name[0].toUpperCase()}
                  </div>
                </Link>
                <button onClick={handleLogout}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #EDE4D3', background: 'white', color: '#6E5528', cursor: 'pointer' }}
                  className="desktop-only">
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }} className="desktop-only">
                <Link to="/login" style={{ fontSize: '0.875rem', color: '#6E5528', textDecoration: 'none', padding: '0.25rem 0.5rem' }}>{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.375rem 0.875rem' }}>{t('nav.register')}</Link>
              </div>
            )}

            {/* Hamburger button */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '5px' }}
              className="hamburger">
              <span style={{ display: 'block', width: '22px', height: '2px', background: '#523D1C', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: '#523D1C', transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: '#523D1C', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: '1px solid #EDE4D3', padding: '0.75rem 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navLinks.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  padding: '0.625rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 500,
                  textDecoration: 'none', color: isActive ? '#2D5616' : '#523D1C',
                  background: isActive ? '#D9EBB8' : 'transparent',
                })}>
                {item.label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #EDE4D3' }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}>{t('nav.login')}</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}>{t('nav.register')}</Link>
              </div>
            )}
            {isAuthenticated && (
              <button onClick={handleLogout}
                style={{ marginTop: '0.5rem', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#C44420', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                {t('nav.logout')}
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        .desktop-nav { display: flex !important; }
        .desktop-only { display: flex !important; }
        .hamburger { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-only { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
