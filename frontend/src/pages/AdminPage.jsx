import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeApi } from '../services/api';
import api from '../services/api';
import { PageHeader, Spinner, TierBadge, CategoryBadge } from '../components/common/UI';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [tab, setTab] = useState('review');

  const { data: pending, isLoading } = useQuery({
    queryKey: ['knowledge', 'pending'],
    queryFn: () => knowledgeApi.list({ status: 'PENDING_REVIEW', limit: 50 }).then(r => r.data.data),
    enabled: tab === 'review',
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(r => r.data),
    enabled: tab === 'users',
  });

  const { mutate: review } = useMutation({
    mutationFn: ({ id, decision, notes }) => knowledgeApi.review(id, { decision, notes }),
    onSuccess: () => { qc.invalidateQueries(['knowledge', 'pending']); toast.success('Review submitted'); },
    onError: () => toast.error('Review failed'),
  });

  const TABS = [
    { id: 'review', label: `Review Queue ${pending ? `(${pending.length})` : ''}` },
    { id: 'users', label: 'Users' },
    { id: 'communities', label: 'Communities' },
  ];

  return (
    <div>
      <PageHeader title={t('nav.admin')} subtitle="Manage knowledge records, users, and communities" />
      <div className="page-container py-8">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-earth-200 mb-8">
          {TABS.map(tab_ => (
            <button key={tab_.id} onClick={() => setTab(tab_.id)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${tab === tab_.id ? 'bg-white border border-b-white border-earth-200 -mb-px text-savanna-700' : 'text-earth-500 hover:text-earth-700'}`}>
              {tab_.label}
            </button>
          ))}
        </div>

        {/* Review Queue */}
        {tab === 'review' && (
          isLoading ? <Spinner /> : !pending?.length ? (
            <div className="text-center py-16 text-earth-400">
              <div className="text-5xl mb-3">✅</div>
              <p>No records pending review</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {pending.map(r => (
                <div key={r.id} className="card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <TierBadge tier={r.accessTier} />
                        <CategoryBadge category={r.category} />
                      </div>
                      <h3 className="font-display font-semibold text-earth-900 text-lg">{r.title}</h3>
                      <p className="text-earth-500 text-sm mt-1 line-clamp-2">{r.description}</p>
                      <div className="flex gap-4 mt-3 text-xs text-earth-400">
                        <span>By: {r.contributor?.name}</span>
                        <span>Community: {r.community?.name}</span>
                        <span>{format(new Date(r.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a href={`/knowledge/${r.id}`} target="_blank" rel="noreferrer"
                        className="btn-ghost text-sm px-3 py-1.5">View</a>
                      <button onClick={() => review({ id: r.id, decision: 'REJECTED' })}
                        className="btn-secondary text-sm px-3 py-1.5 text-clay-600 border-clay-200 hover:bg-clay-50">
                        Reject
                      </button>
                      <button onClick={() => review({ id: r.id, decision: 'APPROVED' })}
                        className="btn-primary text-sm px-3 py-1.5 bg-savanna-600">
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Users */}
        {tab === 'users' && (
          usersLoading ? <Spinner /> : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-earth-50 border-b border-earth-100">
                  <tr>
                    {['Name', 'Email', 'Role', 'Access Tier', 'Verified', 'Joined'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-earth-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100">
                  {users?.map(u => (
                    <tr key={u.id} className="hover:bg-earth-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-earth-900">{u.name}</td>
                      <td className="px-4 py-3 text-earth-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-earth-100 text-earth-700">{u.role}</span>
                      </td>
                      <td className="px-4 py-3"><TierBadge tier={u.accessTier} /></td>
                      <td className="px-4 py-3">
                        <span className={`w-2 h-2 rounded-full inline-block ${u.isVerified ? 'bg-savanna-500' : 'bg-earth-300'}`} />
                      </td>
                      <td className="px-4 py-3 text-earth-400">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Communities placeholder */}
        {tab === 'communities' && (
          <div className="text-center py-16 text-earth-400">
            <div className="text-5xl mb-3">🌍</div>
            <p>Community management coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
