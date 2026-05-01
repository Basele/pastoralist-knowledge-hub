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

  const [search, setSearch] = useState('');
  const category = searchParams.get('category') || '';
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', { category, page, search }],
    queryFn: () => knowledgeApi.list({ category: category || undefined, page, limit: 12, status: 'APPROVED' }).then(r => r.data),
    keepPreviousData: true,
  });

  const records = data?.data || [];
  const meta = data?.meta;

  return (
    <div>
      <PageHeader
        title={t('knowledge.title')}
        action={isAuthenticated && (
          <Link to="/contribute" className="btn-primary">{t('knowledge.add_record')}</Link>
        )}
      />

      <div className="page-container py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="text" placeholder={t('knowledge.search_placeholder')}
            value={search} onChange={e => setSearch(e.target.value)}
            className="input max-w-xs"
          />
          <select
            value={category}
            onChange={e => { setSearchParams(e.target.value ? { category: e.target.value } : {}); setPage(1); }}
            className="input max-w-xs"
          >
            <option value="">{t('knowledge.filter_all')}</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{t(`knowledge.categories.${c}`)}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {isLoading ? <Spinner /> : records.length === 0 ? (
          <EmptyState
            icon="📭"
            title={t('knowledge.no_results')}
            action={isAuthenticated && <Link to="/contribute" className="btn-primary">{t('knowledge.add_record')}</Link>}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {records.map(record => <KnowledgeCard key={record.id} record={record} />)}
            </div>
            {/* Pagination */}
            {meta && meta.pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
                  {t('common.previous')}
                </button>
                <span className="text-earth-500 text-sm">Page {page} of {meta.pages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === meta.pages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
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
