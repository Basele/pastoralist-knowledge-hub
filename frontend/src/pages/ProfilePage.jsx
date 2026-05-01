import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { knowledgeApi } from '../services/api';
import { KnowledgeCard, PageHeader, Spinner, TierBadge } from '../components/common/UI';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['my-knowledge'],
    queryFn: () => knowledgeApi.list({ status: undefined, limit: 20 }).then(r => r.data.data),
  });

  const myRecords = data?.filter(r => r.contributor?.id === user?.id) || [];

  const ROLE_LABELS = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrator',
    ELDER_CUSTODIAN: 'Elder / Custodian',
    COMMUNITY_MEMBER: 'Community Member',
    RESEARCHER: 'Researcher',
    PUBLIC_VIEWER: 'Viewer',
  };

  return (
    <div>
      <PageHeader title={t('nav.profile')} />
      <div className="page-container py-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile card */}
          <div className="card p-6 flex flex-col items-center text-center h-fit">
            <div className="w-20 h-20 rounded-full bg-savanna-100 flex items-center justify-center text-savanna-700 font-display font-bold text-3xl mb-4">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h2 className="font-display text-xl font-semibold text-earth-900">{user?.name}</h2>
            <p className="text-earth-400 text-sm mt-1">{user?.email}</p>
            <div className="flex flex-col gap-2 mt-4 w-full">
              <div className="flex items-center justify-between text-sm py-2 border-t border-earth-100">
                <span className="text-earth-500">Role</span>
                <span className="font-medium text-earth-800">{ROLE_LABELS[user?.role]}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-t border-earth-100">
                <span className="text-earth-500">Access</span>
                <TierBadge tier={user?.accessTier || 'PUBLIC'} />
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-t border-earth-100">
                <span className="text-earth-500">Community</span>
                <span className="font-medium text-earth-800">{user?.community?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-t border-earth-100">
                <span className="text-earth-500">Contributions</span>
                <span className="font-medium text-savanna-700">{myRecords.length}</span>
              </div>
            </div>
          </div>

          {/* Contributions */}
          <div className="md:col-span-2">
            <h3 className="font-display text-xl font-semibold text-earth-900 mb-5">My Contributions</h3>
            {isLoading ? <Spinner /> : myRecords.length === 0 ? (
              <div className="card p-10 text-center text-earth-400">
                <div className="text-4xl mb-3">📝</div>
                <p>You haven't contributed any knowledge yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myRecords.map(r => <KnowledgeCard key={r.id} record={r} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
