import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { knowledgeApi } from '../services/api';
import { KnowledgeCard, PageHeader, Spinner, TierBadge } from '../components/common/UI';

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin', ADMIN: 'Administrator',
  ELDER_CUSTODIAN: 'Elder / Custodian', COMMUNITY_MEMBER: 'Community Member',
  RESEARCHER: 'Researcher', PUBLIC_VIEWER: 'Viewer',
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['my-knowledge'],
    queryFn: () => knowledgeApi.list({ limit: 20 }).then(r => r.data.data),
  });

  const myRecords = data ? data.filter(r => r.contributor && r.contributor.id === (user && user.id)) : [];

  const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.625rem 0', borderTop: '1px solid #EDE4D3' };

  return (
    <div>
      <PageHeader title={t('nav.profile')} />
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* Profile card */}
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: '#D9EBB8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D5616', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '2rem', margin: '0 auto 1rem' }}>
              {user && user.name && user.name[0].toUpperCase()}
            </div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', fontWeight: 600, color: '#1A1008' }}>{user && user.name}</h2>
            <p style={{ color: '#8B6F35', fontSize: '0.875rem', marginTop: '0.25rem' }}>{user && user.email}</p>
            <div style={{ marginTop: '1rem', textAlign: 'left' }}>
              <div style={rowStyle}><span style={{ color: '#8B6F35' }}>Role</span><span style={{ fontWeight: 500, color: '#1A1008' }}>{ROLE_LABELS[user && user.role] || user && user.role}</span></div>
              <div style={rowStyle}><span style={{ color: '#8B6F35' }}>Access</span><TierBadge tier={user && user.accessTier || 'PUBLIC'} /></div>
              <div style={rowStyle}><span style={{ color: '#8B6F35' }}>Community</span><span style={{ fontWeight: 500, color: '#1A1008' }}>{user && user.community && user.community.name || 'None'}</span></div>
              <div style={rowStyle}><span style={{ color: '#8B6F35' }}>Contributions</span><span style={{ fontWeight: 600, color: '#3A700D' }}>{myRecords.length}</span></div>
            </div>
          </div>

          {/* Contributions */}
          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', fontWeight: 600, color: '#1A1008', marginBottom: '1.25rem' }}>My Contributions</h3>
            {isLoading ? <Spinner /> : myRecords.length === 0 ? (
              <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#A88B50' }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>[ ]</p>
                <p>You have not contributed any knowledge yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {myRecords.map(r => <KnowledgeCard key={r.id} record={r} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
