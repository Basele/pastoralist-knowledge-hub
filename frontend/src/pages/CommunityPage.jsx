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
      <PageHeader title={t('nav.community')} subtitle="Discover the pastoralist communities contributing to the hub" />
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {isLoading ? <Spinner /> : !communities || !communities.length ? (
          <EmptyState title="No communities yet" description="Communities will appear here once registered." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {communities.map(c => {
              const name = (isSw && c.nameSwahili) ? c.nameSwahili : c.name;
              const desc = (isSw && c.descriptionSwahili) ? c.descriptionSwahili : c.description;
              return (
                <div key={c.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: '#D9EBB8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D5616', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.25rem', flexShrink: 0 }}>
                      {name[0]}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#1A1008', fontSize: '1rem' }}>{name}</h3>
                      <p style={{ color: '#A88B50', fontSize: '0.75rem' }}>{c.region}, {c.country}</p>
                    </div>
                  </div>
                  {desc && <p style={{ color: '#6E5528', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #EDE4D3', fontSize: '0.8rem', color: '#A88B50', marginBottom: '1rem' }}>
                    <span>{c._count && c._count.members || 0} members</span>
                    <span>{c._count && c._count.knowledgeRecords || 0} records</span>
                  </div>
                  <Link to={'/knowledge?communityId=' + c.id} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.875rem' }}>
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
