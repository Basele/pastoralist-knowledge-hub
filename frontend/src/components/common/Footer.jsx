import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer style={{ background: '#1A1008', color: '#D9C9A8', marginTop: '4rem' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: '#3A700D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>P</div>
              <span style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontWeight: 600 }}>Pastoralist Knowledge Hub</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#8B6F35', lineHeight: 1.6 }}>
              Preserving and sharing indigenous pastoralist knowledge across generations and communities.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem' }}>Explore</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[['/', t('nav.home')], ['/knowledge', t('nav.knowledge')], ['/map', t('nav.map')], ['/community', t('nav.community')]].map(([to, label]) => (
                <Link key={to} to={to} style={{ fontSize: '0.875rem', color: '#8B6F35', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = '#D9C9A8'}
                  onMouseLeave={e => e.target.style.color = '#8B6F35'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem' }}>About</h4>
            <p style={{ fontSize: '0.875rem', color: '#8B6F35', lineHeight: 1.6 }}>
              Community-owned. Culturally sensitive. Built with respect for indigenous data sovereignty.
            </p>
            <p style={{ fontSize: '0.75rem', color: '#523D1C', marginTop: '1rem' }}>
              {new Date().getFullYear()} Pastoralist Knowledge Hub
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}