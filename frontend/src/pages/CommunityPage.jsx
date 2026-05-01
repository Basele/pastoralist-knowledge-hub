import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { communityApi } from '../services/api';
import { PageHeader, Spinner, EmptyState } from '../components/common/UI';

export default function CommunityPage() {
  const { t, i18n } = useTranslation();
  const isSw = i18n.language === 'sw';

  const { data: communities, isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: () => communityApi.list().then(r => r.data),
  });

  return (
    <div>
      <PageHeader
        title={t('nav.community')}
        subtitle="Discover the pastoralist communities contributing to the hub"
      />
      <div className="page-container py-10">
        {isLoading ? <Spinner /> : !communities?.length ? (
          <EmptyState icon="🌍" title="No communities yet" description="Communities will appear here once registered." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map(c => {
              const name = (isSw && c.nameSwahili) ? c.nameSwahili : c.name;
              const desc = (isSw && c.descriptionSwahili) ? c.descriptionSwahili : c.description;
              return (
                <div key={c.id} className="card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {c.logo ? (
                      <img src={c.logo} alt={name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-savanna-100 flex items-center justify-center text-savanna-700 font-display font-bold text-xl">
                        {name[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-display font-semibold text-earth-900">{name}</h3>
                      <p className="text-earth-400 text-xs">{c.region}, {c.country}</p>
                    </div>
                  </div>
                  {desc && <p className="text-earth-500 text-sm leading-relaxed mb-4 line-clamp-3">{desc}</p>}
                  <div className="flex items-center justify-between text-sm text-earth-400 border-t border-earth-100 pt-4">
                    <span>👥 {c._count?.members || 0} members</span>
                    <span>📚 {c._count?.knowledgeRecords || 0} records</span>
                  </div>
                  <Link to={`/knowledge?communityId=${c.id}`} className="btn-secondary w-full justify-center mt-4 text-sm">
                    View Knowledge
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
