import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// â”€â”€ TierBadge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function TierBadge({ tier }) {
  const { t } = useTranslation();
  const styles = {
    PUBLIC:    { background: '#D9EBB8', color: '#1E3D0A' },
    COMMUNITY: { background: '#C4DFF5', color: '#062C55' },
    ELDER:     { background: '#D9C9A8', color: '#362612' },
    SACRED:    { background: '#F8D8C7', color: '#55180C' },
  };
  const s = styles[tier] || styles.PUBLIC;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: s.background, color: s.color }}>
      {t(`tiers.${tier}`)}
    </span>
  );
}

// â”€â”€ CategoryBadge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function CategoryBadge({ category }) {
  const { t } = useTranslation();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: '#EDE4D3', color: '#523D1C' }}>
      {t(`knowledge.categories.${category}`, { defaultValue: category })}
    </span>
  );
}

// â”€â”€ CategoryIcon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function CategoryIcon({ category }) {
  const icons = {
    LIVESTOCK_MANAGEMENT: 'ðŸ„', WATER_SOURCES: 'ðŸ’§', GRAZING_ROUTES: 'ðŸ—ºï¸',
    MEDICINAL_PLANTS: 'ðŸŒ¿', WEATHER_PREDICTION: 'â˜ï¸', CONFLICT_RESOLUTION: 'ðŸ¤',
    CULTURAL_CEREMONIES: 'ðŸŽ­', FOOD_PRESERVATION: 'ðŸ«™', ECOLOGICAL_KNOWLEDGE: 'ðŸŒ±',
    ORAL_HISTORY: 'ðŸ“–', GOVERNANCE: 'âš–ï¸', OTHER: 'ðŸ“‹',
  };
  return <span style={{ fontSize: '2rem' }}>{icons[category] || 'ðŸ“‹'}</span>;
}

// â”€â”€ KnowledgeCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function KnowledgeCard({ record }) {
  const { i18n } = useTranslation();
  const isSw = i18n.language === 'sw';
  const title = (isSw && record.titleSwahili) ? record.titleSwahili : record.title;
  const description = (isSw && record.descriptionSwahili) ? record.descriptionSwahili : record.description;
  const thumb = record.mediaFiles?.[0]?.cdnUrl;

  return (
    <Link to={`/knowledge/${record.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ overflow: 'hidden', height: '100%' }}>
        {thumb ? (
          <div style={{ height: '11rem', overflow: 'hidden', background: '#EDE4D3' }}>
            <img src={thumb} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{ height: '11rem', background: 'linear-gradient(135deg, #F0F7E6, #EDE4D3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CategoryIcon category={record.category} />
          </div>
        )}
        <div style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <TierBadge tier={record.accessTier} />
            <CategoryBadge category={record.category} />
          </div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#1A1008', fontSize: '1.125rem', lineHeight: 1.4, marginBottom: '0.375rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {title}
          </h3>
          <p style={{ color: '#8B6F35', fontSize: '0.875rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description}
          </p>
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #EDE4D3', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#A88B50' }}>
            <span>{record.community?.name}</span>
            <span>{record.viewCount ?? 0} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// â”€â”€ Spinner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function Spinner({ size = 'md' }) {
  const sizes = { sm: '1rem', md: '2rem', lg: '3rem' };
  const s = sizes[size];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: s, height: s, border: '2px solid #EDE4D3', borderTop: '2px solid #3A700D', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// â”€â”€ EmptyState â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function EmptyState({ icon = 'ðŸ“­', title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#523D1C', marginBottom: '0.5rem' }}>{title}</h3>
      {description && <p style={{ color: '#A88B50', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '24rem' }}>{description}</p>}
      {action}
    </div>
  );
}

// â”€â”€ PageHeader â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ background: 'white', borderBottom: '1px solid #EDE4D3' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', fontWeight: 600, color: '#1A1008' }}>{title}</h1>
            {subtitle && <p style={{ color: '#8B6F35', marginTop: '0.25rem' }}>{subtitle}</p>}
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}
