import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { knowledgeApi } from '../services/api';
import { TierBadge, CategoryBadge, Spinner } from '../components/common/UI';
import { format } from 'date-fns';

export default function KnowledgeDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isSw = i18n.language === 'sw';

  const { data: record, isLoading, error } = useQuery({
    queryKey: ['knowledge', id],
    queryFn: () => knowledgeApi.get(id).then(r => r.data),
  });

  if (isLoading) return <Spinner />;
  if (error) return (
    <div className="page-container py-20 text-center">
      <p className="text-clay-600">You don't have permission to view this record, or it doesn't exist.</p>
      <Link to="/knowledge" className="btn-primary mt-4 inline-flex">← Back to Knowledge</Link>
    </div>
  );

  const title = (isSw && record.titleSwahili) ? record.titleSwahili : record.title;
  const description = (isSw && record.descriptionSwahili) ? record.descriptionSwahili : record.description;
  const content = (isSw && record.contentSwahili) ? record.contentSwahili : record.content;

  return (
    <div className="page-container py-10 max-w-4xl">
      <Link to="/knowledge" className="btn-ghost mb-6 inline-flex text-sm">← {t('common.back')}</Link>

      <div className="card p-8">
        {/* Header */}
        <div className="flex flex-wrap gap-2 mb-4">
          <TierBadge tier={record.accessTier} />
          <CategoryBadge category={record.category} />
          {record.verifiedByElder && (
            <span className="badge bg-amber-100 text-amber-800">✓ Elder Verified</span>
          )}
        </div>

        <h1 className="font-display text-3xl font-bold text-earth-900 mb-3">{title}</h1>
        <p className="text-earth-500 text-lg mb-6">{description}</p>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-y border-earth-100 mb-8 text-sm">
          <div>
            <div className="text-earth-400 text-xs mb-0.5">{t('knowledge.contribute_label')}</div>
            <div className="font-medium text-earth-700">{record.contributor?.name}</div>
          </div>
          <div>
            <div className="text-earth-400 text-xs mb-0.5">{t('knowledge.community_label')}</div>
            <div className="font-medium text-earth-700">{record.community?.name}</div>
          </div>
          {record.location && (
            <div>
              <div className="text-earth-400 text-xs mb-0.5">Location</div>
              <div className="font-medium text-earth-700">{record.location.name}</div>
            </div>
          )}
          <div>
            <div className="text-earth-400 text-xs mb-0.5">Added</div>
            <div className="font-medium text-earth-700">{format(new Date(record.createdAt), 'MMM d, yyyy')}</div>
          </div>
        </div>

        {/* Media */}
        {record.mediaFiles?.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-3">
              {record.mediaFiles.filter(m => m.mediaType === 'IMAGE').map(m => (
                <img key={m.id} src={m.cdnUrl || m.url} alt={m.caption || title}
                  className="rounded-xl w-full h-48 object-cover" />
              ))}
              {record.mediaFiles.filter(m => m.mediaType === 'AUDIO').map(m => (
                <div key={m.id} className="bg-earth-50 rounded-xl p-4">
                  <p className="text-xs text-earth-500 mb-2">{m.caption || 'Audio recording'}</p>
                  <audio controls src={m.cdnUrl || m.url} className="w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="prose max-w-none">
          <div className="text-earth-700 leading-relaxed whitespace-pre-line">{content}</div>
        </div>

        {/* Cultural context */}
        {record.culturalContext && (
          <div className="mt-8 p-5 bg-savanna-50 rounded-xl border border-savanna-100">
            <h3 className="font-semibold text-savanna-800 mb-2">Cultural Context</h3>
            <p className="text-savanna-700 text-sm leading-relaxed">{record.culturalContext}</p>
          </div>
        )}

        {/* Tags */}
        {record.tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {record.tags.map(tag => (
              <span key={tag} className="badge bg-earth-100 text-earth-600">#{tag}</span>
            ))}
          </div>
        )}

        {/* Comments */}
        {record.comments?.length > 0 && (
          <div className="mt-10 border-t border-earth-100 pt-8">
            <h3 className="font-display text-xl font-semibold mb-5">Community Responses ({record.comments.length})</h3>
            <div className="flex flex-col gap-4">
              {record.comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-earth-100 flex items-center justify-center text-earth-500 font-medium text-sm flex-shrink-0">
                    {c.author.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-earth-800">{c.author.name}</span>
                      <span className="text-earth-400 text-xs">{format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <p className="text-earth-600 text-sm leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
