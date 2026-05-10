import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { knowledgeApi } from '../services/api';
import { KnowledgeCard, Spinner, EmptyState, PageHeader } from '../components/common/UI';
import { useAuthStore } from '../store/authStore';

const CATEGORIES = [
  'LIVESTOCK_MANAGEMENT','WATER_SOURCES','GRAZING_ROUTES','MEDICINAL_PLANTS',
  'WEATHER_PREDICTION','CONFLICT_RESOLUTION','CULTURAL_CEREMONIES','FOOD_PRESERVATION',
  'ECOLOGICAL_KNOWLEDGE','ORAL_HISTORY','GOVERNANCE','OTHER',
];

export default function KnowledgePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const category = searchParams.get('category') || '';
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', { category, page }],
    queryFn: () => knowledgeApi.list({ category: category || undefined, page, limit: 12, status: 'APPROVED' }).then(r => r.data),
    keepPreviousData: true,
  });

  const records = data && data.data ? data.data : [];
  const meta = data && data.meta;

  return (
    <div>
      <PageHeader
        title={t('knowledge.title')}
        action={isAuthenticated && (
          <Link to="/contribute" className="btn-primary">{t('knowledge.add_record')}</Link>
        )}
      />
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
          <select value={category}
            onChange={e => { setSearchParams(e.target.value ? { category: e.target.value } : {}); setPage(1); }}
            className="input" style={{ maxWidth: '280px' }}>
            <option value="">{t('knowledge.filter_all')}</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{t('knowledge.categories.' + c)}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {isLoading ? <Spinner /> : records.length === 0 ? (
          <EmptyState
            title={t('knowledge.no_results')}
            action={isAuthenticated && <Link to="/contribute" className="btn-primary">{t('knowledge.add_record')}</Link>}
          />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {records.map(record => <KnowledgeCard key={record.id} record={record} />)}
            </div>
            {meta && meta.pages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary" style={{ fontSize: '0.875rem' }}>
                  {t('common.previous')}
                </button>
                <span style={{ color: '#8B6F35', fontSize: '0.875rem' }}>Page {page} of {meta.pages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === meta.pages} className="btn-secondary" style={{ fontSize: '0.875rem' }}>
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
