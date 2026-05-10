import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeApi } from '../services/api';
import api from '../services/api';
import { TierBadge, CategoryBadge, Spinner } from '../components/common/UI';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function KnowledgeDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const qc = useQueryClient();
  const isSw = i18n.language === 'sw';
  const [comment, setComment] = useState('');

  const { data: record, isLoading, error } = useQuery({
    queryKey: ['knowledge', id],
    queryFn: () => knowledgeApi.get(id).then(r => r.data),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => api.get('/knowledge/' + id + '/comments').then(r => r.data),
    enabled: !!record,
  });

  const { mutate: postComment, isLoading: posting } = useMutation({
    mutationFn: (data) => api.post('/knowledge/' + id + '/comments', data),
    onSuccess: () => { qc.invalidateQueries(['comments', id]); setComment(''); toast.success('Response posted'); },
    onError: () => toast.error('Failed to post'),
  });

  const { mutate: deleteComment } = useMutation({
    mutationFn: (cid) => api.delete('/knowledge/' + id + '/comments/' + cid),
    onSuccess: () => { qc.invalidateQueries(['comments', id]); toast.success('Deleted'); },
  });

  if (isLoading) return <Spinner />;
  if (error) return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
      <p style={{ color: '#C44420', marginBottom: '1rem' }}>You do not have permission to view this record.</p>
      <Link to="/knowledge" className="btn-primary">Back to Knowledge</Link>
    </div>
  );

  const title = (isSw && record.titleSwahili) ? record.titleSwahili : record.title;
  const description = (isSw && record.descriptionSwahili) ? record.descriptionSwahili : record.description;
  const content = (isSw && record.contentSwahili) ? record.contentSwahili : record.content;

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <Link to="/knowledge" className="btn-ghost" style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
        &larr; {t('common.back')}
      </Link>

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <TierBadge tier={record.accessTier} />
          <CategoryBadge category={record.category} />
          {record.verifiedByElder && (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: '#FEF3C7', color: '#92400E' }}>
              Elder Verified
            </span>
          )}
        </div>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: '#1A1008', marginBottom: '0.75rem', lineHeight: 1.3 }}>{title}</h1>
        <p style={{ color: '#6E5528', fontSize: '1.125rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{description}</p>

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', padding: '1.25rem 0', borderTop: '1px solid #EDE4D3', borderBottom: '1px solid #EDE4D3', marginBottom: '2rem' }}>
          {[
            ['Contributed by', record.contributor && record.contributor.name],
            ['Community', record.community && record.community.name],
            record.location && ['Location', record.location.name],
            ['Added', format(new Date(record.createdAt), 'MMM d, yyyy')],
          ].filter(Boolean).map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: '0.75rem', color: '#A88B50', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontWeight: 500, color: '#523D1C', fontSize: '0.875rem' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Media */}
        {record.mediaFiles && record.mediaFiles.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
            {record.mediaFiles.filter(m => m.mediaType === 'IMAGE').map(m => (
              <img key={m.id} src={m.cdnUrl || m.url} alt={title}
                style={{ borderRadius: '0.75rem', width: '100%', height: '12rem', objectFit: 'cover' }} />
            ))}
            {record.mediaFiles.filter(m => m.mediaType === 'AUDIO').map(m => (
              <div key={m.id} style={{ background: '#F7F3ED', borderRadius: '0.75rem', padding: '1rem' }}>
                <audio controls src={m.cdnUrl || m.url} style={{ width: '100%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ color: '#523D1C', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '1rem' }}>{content}</div>

        {/* Cultural context */}
        {record.culturalContext && (
          <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#F0F7E6', borderRadius: '0.75rem', borderLeft: '3px solid #3A700D' }}>
            <h3 style={{ fontWeight: 600, color: '#2D5616', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Cultural Context</h3>
            <p style={{ color: '#3A700D', fontSize: '0.875rem', lineHeight: 1.6 }}>{record.culturalContext}</p>
          </div>
        )}

        {/* Tags */}
        {record.tags && record.tags.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {record.tags.map(tag => (
              <span key={tag} style={{ background: '#EDE4D3', color: '#6E5528', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem' }}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Comments */}
      <div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 600, color: '#1A1008', marginBottom: '1.25rem' }}>
          Community Responses ({comments.length})
        </h2>

        {isAuthenticated ? (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Share your knowledge or ask a question..."
              rows={3} className="input" style={{ marginBottom: '0.75rem' }} />
            <button onClick={() => postComment({ content: comment })}
              disabled={!comment.trim() || posting} className="btn-primary" style={{ fontSize: '0.875rem' }}>
              {posting ? 'Posting...' : 'Post Response'}
            </button>
          </div>
        ) : (
          <div style={{ background: '#F7F3ED', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            <p style={{ color: '#8B6F35', fontSize: '0.875rem' }}>
              <Link to="/login" style={{ color: '#3A700D', fontWeight: 500 }}>Sign in</Link> to add your response
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comments.map(c => (
            <div key={c.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: '#D9EBB8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D5616', fontWeight: 600, fontSize: '0.875rem', flexShrink: 0 }}>
                  {c.author.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem', color: '#1A1008' }}>{c.author.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#A88B50' }}>{format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
                    {user && (user.id === c.author.id || ['ADMIN','SUPER_ADMIN'].includes(user.role)) && (
                      <button onClick={() => deleteComment(c.id)}
                        style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#C44420', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Delete
                      </button>
                    )}
                  </div>
                  <p style={{ color: '#523D1C', fontSize: '0.875rem', lineHeight: 1.6 }}>{c.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
