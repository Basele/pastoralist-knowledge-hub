import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { knowledgeApi, communityApi } from '../services/api';
import { KnowledgeCard, Spinner, CategoryIcon } from '../components/common/UI';

const CATEGORIES = [
  'LIVESTOCK_MANAGEMENT','WATER_SOURCES','GRAZING_ROUTES','MEDICINAL_PLANTS',
  'WEATHER_PREDICTION','ORAL_HISTORY','ECOLOGICAL_KNOWLEDGE','CULTURAL_CEREMONIES',
];

export default function HomePage() {
  const { t } = useTranslation();
  const { data: featured, isLoading } = useQuery({
    queryKey: ['knowledge', 'featured'],
    queryFn: () => knowledgeApi.list({ limit: 6, status: 'APPROVED' }).then(r => r.data.data),
  });
  const { data: communities } = useQuery({
    queryKey: ['communities'],
    queryFn: () => communityApi.list().then(r => r.data),
  });

  return (
    <div>
      <section style={{ background: 'linear-gradient(135deg, #2D5616 0%, #1E3D0A 60%, #1A1008 100%)', color: 'white', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ maxWidth: '42rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '0.375rem 1rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <span style={{ width: '0.5rem', height: '0.5rem', background: '#95C44D', borderRadius: '50%' }} />
              Pastoralist Indigenous Knowledge Hub
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: '1.5rem' }}>
              {t('home.hero_title')}
            </h1>
            <p style={{ color: '#BADA83', fontSize: '1.125rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '36rem' }}>
              {t('home.hero_subtitle')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Link to="/knowledge" className="btn-primary" style={{ background: 'white', color: '#2D5616', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                {t('home.explore_knowledge')} &rarr;
              </Link>
              <Link to="/map" className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', background: 'transparent', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: 'white', borderBottom: '1px solid #EDE4D3' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {[
              { value: featured?.length || '0', label: t('home.stats_records') },
              { value: communities?.length || '0', label: t('home.stats_communities') },
              { value: '2', label: t('home.stats_languages') },
              { value: '4', label: 'Access Tiers' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: '#3A700D' }}>{value}</div>
                <div style={{ color: '#8B6F35', fontSize: '0.875rem', marginTop: '0.25rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', fontWeight: 600, color: '#1A1008', marginBottom: '2rem' }}>{t('home.categories_title')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {CATEGORIES.map(cat => (
            <Link key={cat} to={"/knowledge?category=" + cat} className="card"
              style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center', textDecoration: 'none' }}>
              <div style={{ fontSize: '2rem' }}><CategoryIcon category={cat} /></div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#523D1C' }}>
                {t("knowledge.categories." + cat)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ background: '#F7F3ED', padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', fontWeight: 600, color: '#1A1008' }}>{t('home.featured_title')}</h2>
            <Link to="/knowledge" className="btn-ghost" style={{ color: '#3A700D' }}>{t('common.see_all')} &rarr;</Link>
          </div>
          {isLoading ? <Spinner /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {featured?.map(record => <KnowledgeCard key={record.id} record={record} />)}
            </div>
          )}
        </div>
      </section>

      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', fontWeight: 600, color: '#1A1008', marginBottom: '1rem' }}>Share Your Community Knowledge</h2>
          <p style={{ color: '#8B6F35', marginBottom: '2rem' }}>Join pastoralist communities in preserving indigenous wisdom for future generations.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Join the Hub</Link>
            <Link to="/community" className="btn-secondary" style={{ padding: '0.75rem 2rem' }}>Learn More</Link>
          </div>
        </div>
      </section>
    </div>
  );
}