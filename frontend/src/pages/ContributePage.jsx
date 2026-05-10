import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { knowledgeApi, locationApi } from '../services/api';
import { PageHeader } from '../components/common/UI';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'LIVESTOCK_MANAGEMENT','WATER_SOURCES','GRAZING_ROUTES','MEDICINAL_PLANTS',
  'WEATHER_PREDICTION','CONFLICT_RESOLUTION','CULTURAL_CEREMONIES','FOOD_PRESERVATION',
  'ECOLOGICAL_KNOWLEDGE','ORAL_HISTORY','GOVERNANCE','OTHER',
];
const TIERS = ['PUBLIC','COMMUNITY','ELDER','SACRED'];

export default function ContributePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', titleSwahili: '', description: '', descriptionSwahili: '',
    content: '', contentSwahili: '', category: '', accessTier: 'PUBLIC',
    tags: '', source: '', culturalContext: '', locationId: '',
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationApi.list().then(r => r.data),
  });

  const { mutate: submit, isLoading } = useMutation({
    mutationFn: (data) => knowledgeApi.create(data),
    onSuccess: (res) => { toast.success('Submitted for review!'); navigate('/knowledge/' + res.data.id); },
    onError: (err) => toast.error(err.response && err.response.data && err.response.data.error || 'Submission failed'),
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.content || !form.category) {
      toast.error('Please fill in all required fields'); return;
    }
    submit({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), locationId: form.locationId || undefined });
  };

  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#523D1C', marginBottom: '0.375rem' };
  const stepActive = { width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600, background: '#3A700D', color: 'white', cursor: 'pointer', border: 'none' };
  const stepDone = { ...stepActive, background: '#BADA83', color: '#1E3D0A' };
  const stepInactive = { ...stepActive, background: '#EDE4D3', color: '#8B6F35' };

  return (
    <div>
      <PageHeader title={t('contribute.title')} subtitle={t('contribute.subtitle')} />
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => setStep(s)} style={step === s ? stepActive : step > s ? stepDone : stepInactive}>{s}</button>
              {s < 3 && <div style={{ width: '3rem', height: '2px', background: step > s ? '#BADA83' : '#EDE4D3' }} />}
            </div>
          ))}
          <span style={{ marginLeft: '0.75rem', fontSize: '0.875rem', color: '#8B6F35' }}>
            {step === 1 ? 'Basic Information' : step === 2 ? 'Content & Details' : 'Review & Submit'}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {step === 1 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>{t('contribute.form_title')} *</label>
                    <input type="text" className="input" value={form.title} onChange={set('title')} required />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('contribute.form_title_sw')}</label>
                    <input type="text" className="input" value={form.titleSwahili} onChange={set('titleSwahili')} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>{t('contribute.form_category')} *</label>
                    <select className="input" value={form.category} onChange={set('category')} required>
                      <option value="">Select category...</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{t('knowledge.categories.' + c)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{t('contribute.form_access')}</label>
                    <select className="input" value={form.accessTier} onChange={set('accessTier')}>
                      {TIERS.map(tier => <option key={tier} value={tier}>{t('contribute.tiers.' + tier)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{t('contribute.form_description')} *</label>
                  <textarea rows={3} className="input" value={form.description} onChange={set('description')} required />
                </div>
                <div>
                  <label style={labelStyle}>Description (Swahili)</label>
                  <textarea rows={3} className="input" value={form.descriptionSwahili} onChange={set('descriptionSwahili')} placeholder="Maelezo kwa Kiswahili..." />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label style={labelStyle}>{t('contribute.form_content')} * (English)</label>
                  <textarea rows={7} className="input" value={form.content} onChange={set('content')} required placeholder="Describe in detail..." />
                </div>
                <div>
                  <label style={labelStyle}>Detailed Content (Swahili)</label>
                  <textarea rows={7} className="input" value={form.contentSwahili} onChange={set('contentSwahili')} placeholder="Maelezo ya kina kwa Kiswahili..." />
                </div>
                <div>
                  <label style={labelStyle}>Cultural Context</label>
                  <textarea rows={3} className="input" value={form.culturalContext} onChange={set('culturalContext')} placeholder="Cultural significance and protocols..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>{t('contribute.form_tags')}</label>
                    <input type="text" className="input" value={form.tags} onChange={set('tags')} placeholder="cattle, dry season, Kenya" />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('contribute.form_source')}</label>
                    <input type="text" className="input" value={form.source} onChange={set('source')} placeholder="Elder name, oral tradition..." />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{t('contribute.form_location')}</label>
                  <select className="input" value={form.locationId} onChange={set('locationId')}>
                    <option value="">No specific location</option>
                    {locations && locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div style={{ background: '#F7F3ED', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ fontWeight: 600, color: '#1A1008', marginBottom: '0.75rem' }}>Review Summary</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                    {[['Title', form.title], ['Category', form.category], ['Access Tier', form.accessTier], ['Tags', form.tags]].map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color: '#8B6F35' }}>{k}: </span>
                        <span style={{ color: '#1A1008', fontWeight: 500 }}>{v || 'Not set'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: '#F0F7E6', borderRadius: '0.75rem', padding: '1rem', borderLeft: '3px solid #3A700D', fontSize: '0.875rem', color: '#2D5616' }}>
                  Your submission will be reviewed by community elders before being published.
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #EDE4D3' }}>
              {step > 1 ? (
                <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary">{t('common.previous')}</button>
              ) : <div />}
              {step < 3 ? (
                <button type="button" onClick={() => setStep(s => s + 1)} className="btn-primary">{t('common.next')}</button>
              ) : (
                <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: '0.625rem 2rem' }}>
                  {isLoading ? 'Submitting...' : t('contribute.form_submit')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
