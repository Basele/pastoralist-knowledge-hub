import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

// ── TierBadge ─────────────────────────────────────────────────────────────────
export function TierBadge({ tier }) {
  const { t } = useTranslation();
  const classes = {
    PUBLIC:    'badge-public',
    COMMUNITY: 'badge-community',
    ELDER:     'badge-elder',
    SACRED:    'badge-sacred',
  };
  return <span className={clsx('badge', classes[tier] || 'badge-public')}>{t(`tiers.${tier}`)}</span>;
}

// ── CategoryBadge ─────────────────────────────────────────────────────────────
export function CategoryBadge({ category }) {
  const { t } = useTranslation();
  return (
    <span className="badge bg-earth-100 text-earth-700">
      {t(`knowledge.categories.${category}`, { defaultValue: category })}
    </span>
  );
}

// ── KnowledgeCard ─────────────────────────────────────────────────────────────
export function KnowledgeCard({ record }) {
  const { i18n } = useTranslation();
  const isSw = i18n.language === 'sw';
  const title = (isSw && record.titleSwahili) ? record.titleSwahili : record.title;
  const description = (isSw && record.descriptionSwahili) ? record.descriptionSwahili : record.description;
  const thumb = record.mediaFiles?.[0]?.cdnUrl;

  return (
    <Link to={`/knowledge/${record.id}`} className="card block overflow-hidden group">
      {thumb && (
        <div className="h-44 overflow-hidden bg-earth-100">
          <img src={thumb} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      {!thumb && (
        <div className="h-44 bg-gradient-to-br from-savanna-50 to-earth-100 flex items-center justify-center">
          <CategoryIcon category={record.category} />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <TierBadge tier={record.accessTier} />
          <CategoryBadge category={record.category} />
        </div>
        <h3 className="font-display font-semibold text-earth-900 text-lg leading-snug mb-1 line-clamp-2 group-hover:text-savanna-700 transition-colors">
          {title}
        </h3>
        <p className="text-earth-500 text-sm line-clamp-2 leading-relaxed">{description}</p>
        <div className="mt-4 pt-3 border-t border-earth-100 flex items-center justify-between text-xs text-earth-400">
          <span>{record.community?.name}</span>
          <span>{record.viewCount ?? 0} views</span>
        </div>
      </div>
    </Link>
  );
}

// ── CategoryIcon ──────────────────────────────────────────────────────────────
export function CategoryIcon({ category, className = 'w-12 h-12 text-earth-300' }) {
  const icons = {
    LIVESTOCK_MANAGEMENT: '🐄',
    WATER_SOURCES: '💧',
    GRAZING_ROUTES: '🗺️',
    MEDICINAL_PLANTS: '🌿',
    WEATHER_PREDICTION: '☁️',
    CONFLICT_RESOLUTION: '🤝',
    CULTURAL_CEREMONIES: '🎭',
    FOOD_PRESERVATION: '🫙',
    ECOLOGICAL_KNOWLEDGE: '🌱',
    ORAL_HISTORY: '📖',
    GOVERNANCE: '⚖️',
    OTHER: '📋',
  };
  return <span className="text-4xl">{icons[category] || '📋'}</span>;
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div className="flex items-center justify-center p-8">
      <div className={clsx(s, 'border-2 border-earth-200 border-t-savanna-600 rounded-full animate-spin')} />
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="font-display text-xl text-earth-700 mb-2">{title}</h3>
      {description && <p className="text-earth-400 text-sm mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="bg-white border-b border-earth-100">
      <div className="page-container py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="section-title">{title}</h1>
            {subtitle && <p className="text-earth-500 mt-1">{subtitle}</p>}
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}
