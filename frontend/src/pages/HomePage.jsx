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
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-savanna-700 via-savanna-800 to-earth-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #C4AD7C 0%, transparent 60%), radial-gradient(circle at 80% 20%, #538C1A 0%, transparent 50%)' }} />
        <div className="page-container py-20 md:py-28 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-savanna-400 rounded-full animate-pulse" />
              Pastoralist Indigenous Knowledge Hub
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {t('home.hero_title')}
            </h1>
            <p className="text-savanna-100 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              {t('home.hero_subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/knowledge" className="btn-primary bg-white text-savanna-800 hover:bg-earth-50 px-6 py-3">
                {t('home.explore_knowledge')} →
              </Link>
              <Link to="/map" className="btn-secondary border-white/30 text-white hover:bg-white/10 px-6 py-3">
                🗺️ {t('home.view_map')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-earth-100">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: featured?.length || '0', label: t('home.stats_records') },
              { value: communities?.length || '0', label: t('home.stats_communities') },
              { value: '2', label: t('home.stats_languages') },
              { value: '4', label: 'Access Tiers' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-3xl font-bold text-savanna-700">{value}</div>
                <div className="text-earth-500 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="page-container py-14">
        <h2 className="section-title mb-8">{t('home.categories_title')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat} to={`/knowledge?category=${cat}`}
              className="card p-5 flex flex-col items-center gap-3 text-center hover:border-savanna-200 group">
              <div className="text-3xl"><CategoryIcon category={cat} /></div>
              <span className="text-sm font-medium text-earth-700 group-hover:text-savanna-700 transition-colors">
                {t(`knowledge.categories.${cat}`)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Knowledge */}
      <section className="bg-earth-50 py-14">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">{t('home.featured_title')}</h2>
            <Link to="/knowledge" className="btn-ghost text-savanna-700">{t('common.see_all')} →</Link>
          </div>
          {isLoading ? <Spinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured?.map(record => <KnowledgeCard key={record.id} record={record} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="page-container py-16 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="section-title mb-4">Share Your Community's Knowledge</h2>
          <p className="text-earth-500 mb-8">Join pastoralist communities in preserving indigenous wisdom for future generations.</p>
          <div className="flex justify-center gap-3">
            <Link to="/register" className="btn-primary px-8 py-3">Join the Hub</Link>
            <Link to="/community" className="btn-secondary px-8 py-3">Learn More</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
