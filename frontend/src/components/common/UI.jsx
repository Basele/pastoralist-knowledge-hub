import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
      {t('tiers.' + tier)}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const { t } = useTranslation();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: '#EDE4D3', color: '#523D1C' }}>
      {t('knowledge.categories.' + category, { defaultValue: category })}
    </span>
  );
}

export function CategoryIcon({ category }) {
  const config = {
    LIVESTOCK_MANAGEMENT: { label: 'LIVE', color: '#8B6F35' },
    WATER_SOURCES:        { label: 'H2O',  color: '#1A6EB8' },
    GRAZING_ROUTES:       { label: 'GRAZ', color: '#C44420' },
    MEDICINAL_PLANTS:     { label: 'MED',  color: '#2D5616' },
    WEATHER_PREDICTION:   { label: 'WTHR', color: '#525252' },
    CONFLICT_RESOLUTION:  { label: 'PEAC', color: '#3A700D' },
    CULTURAL_CEREMONIES:  { label: 'CULT', color: '#7B2D8B' },
    FOOD_PRESERVATION:    { label: 'FOOD', color: '#C44420' },
    ECOLOGICAL_KNOWLEDGE: { label: 'ECO',  color: '#2D5616' },
    ORAL_HISTORY:         { label: 'ORAL', color: '#362612' },
    GOVERNANCE:           { label: 'GOV',  color: '#8B6F35' },
    OTHER:                { label: 'INFO', color: '#525252' },
  };
  const c = config[category] || config.OTHER;
  return (
    <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: c.color + '22', border: '2px solid ' + c.color + '55', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, fontWeight: 700, fontSize: '0.65rem', fontFamily: 'Source Sans 3, sans-serif', letterSpacing: '0.02em' }}>
      {c.label}
    </div>
  );
}

export function KnowledgeCard({ record }) {
  const { i18n } = useTranslation();
  const isSw = i18n.language === 'sw';
  const title = (isSw && record.titleSwahili) ? record.titleSwahili : record.title;
  const description = (isSw && record.descriptionSwahili) ? record.descriptionSwahili : record.description;
  const thumb = record.mediaFiles && record.mediaFiles[0] && record.mediaFiles[0].cdnUrl;

  return (
    <Link to={'/knowledge/' + record.id} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div className="card" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {thumb ? (
          <div style={{ height: '11rem', overflow: 'hidden', background: '#EDE4D3', flexShrink: 0 }}>
            <img src={thumb} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{ height: '11rem', background: 'linear-gradient(135deg, #F0F7E6, #EDE4D3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CategoryIcon category={record.category} />
          </div>
        )}
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
            <TierBadge tier={record.accessTier} />
            <CategoryBadge category={record.category} />
          </div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#1A1008', fontSize: '1.125rem', lineHeight: 1.4, marginBottom: '0.375rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {title}
          </h3>
          <p style={{ color: '#8B6F35', fontSize: '0.875rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
            {description}
          </p>
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #EDE4D3', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#A88B50' }}>
            <span>{record.community && record.community.name}</span>
            <span>{record.viewCount || 0} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function Spinner({ size }) {
  const s = size === 'sm' ? '1.25rem' : size === 'lg' ? '3rem' : '2rem';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: s, height: s, border: '2px solid #EDE4D3', borderTop: '2px solid #3A700D', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', textAlign: 'center' }}>
      {icon && <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>}
      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#523D1C', marginBottom: '0.5rem' }}>{title}</h3>
      {description && <p style={{ color: '#A88B50', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '24rem' }}>{description}</p>}
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ background: 'white', borderBottom: '1px solid #EDE4D3' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', fontWeight: 600, color: '#1A1008' }}>{title}</h1>
            {subtitle && <p style={{ color: '#8B6F35', marginTop: '0.375rem' }}>{subtitle}</p>}
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}
