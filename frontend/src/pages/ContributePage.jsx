import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { knowledgeApi, locationApi, mediaApi } from '../services/api';
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState([]);

  const [form, setForm] = useState({
    title: '', titleSwahili: '',
    description: '', descriptionSwahili: '',
    content: '', contentSwahili: '',
    category: '', accessTier: 'PUBLIC',
    tags: '', source: '',
    culturalContext: '', locationId: '',
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationApi.list().then(r => r.data),
  });

  const { mutate: submit, isLoading } = useMutation({
    mutationFn: (data) => knowledgeApi.create(data),
    onSuccess: (res) => {
      toast.success('Knowledge submitted for review!');
      navigate(`/knowledge/${res.data.id}`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Submission failed'),
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('accessTier', form.accessTier);
    try {
      const res = await mediaApi.upload(fd, setUploadProgress);
      setUploadedMedia(m => [...m, res.data]);
      toast.success('File uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.content || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    submit({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      locationId: form.locationId || undefined,
    });
  };

  const inputClass = "input";
  const labelClass = "block text-sm font-medium text-earth-700 mb-1.5";

  return (
    <div>
      <PageHeader title={t('contribute.title')} subtitle={t('contribute.subtitle')} />
      <div className="page-container py-10 max-w-3xl">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <button onClick={() => setStep(s)}
                className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors ${step === s ? 'bg-savanna-600 text-white' : step > s ? 'bg-savanna-200 text-savanna-700' : 'bg-earth-100 text-earth-400'}`}>
                {s}
              </button>
              {s < 3 && <div className={`h-0.5 w-12 ${step > s ? 'bg-savanna-400' : 'bg-earth-200'}`} />}
            </div>
          ))}
          <div className="ml-3 text-sm text-earth-500">
            {step === 1 ? 'Basic Information' : step === 2 ? 'Content & Details' : 'Media & Submit'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card p-8 flex flex-col gap-6">

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>{t('contribute.form_title')} *</label>
                    <input type="text" className={inputClass} value={form.title} onChange={set('title')} required />
                  </div>
                  <div>
                    <label className={labelClass}>{t('contribute.form_title_sw')}</label>
                    <input type="text" className={inputClass} value={form.titleSwahili} onChange={set('titleSwahili')} placeholder="Kichwa kwa Kiswahili" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>{t('contribute.form_category')} *</label>
                    <select className={inputClass} value={form.category} onChange={set('category')} required>
                      <option value="">Select category...</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{t(`knowledge.categories.${c}`)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('contribute.form_access')} *</label>
                    <select className={inputClass} value={form.accessTier} onChange={set('accessTier')}>
                      {TIERS.map(tier => <option key={tier} value={tier}>{t(`contribute.tiers.${tier}`)}</option>)}
                    </select>
                    <p className="text-xs text-earth-400 mt-1">{t('contribute.access_help')}</p>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t('contribute.form_description')} *</label>
                  <textarea rows={3} className={inputClass} value={form.description} onChange={set('description')} required />
                </div>
                <div>
                  <label className={labelClass}>Description in Swahili</label>
                  <textarea rows={3} className={inputClass} value={form.descriptionSwahili} onChange={set('descriptionSwahili')} placeholder="Maelezo kwa Kiswahili..." />
                </div>
              </>
            )}

            {/* Step 2: Content */}
            {step === 2 && (
              <>
                <div>
                  <label className={labelClass}>{t('contribute.form_content')} * (English)</label>
                  <textarea rows={8} className={inputClass} value={form.content} onChange={set('content')} required
                    placeholder="Describe the knowledge in detail — practices, methods, context, seasonal relevance..." />
                </div>
                <div>
                  <label className={labelClass}>Detailed Content (Swahili)</label>
                  <textarea rows={8} className={inputClass} value={form.contentSwahili} onChange={set('contentSwahili')}
                    placeholder="Maelezo ya kina kwa Kiswahili..." />
                </div>
                <div>
                  <label className={labelClass}>Cultural Context</label>
                  <textarea rows={4} className={inputClass} value={form.culturalContext} onChange={set('culturalContext')}
                    placeholder="Explain the cultural significance and any protocols around this knowledge..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>{t('contribute.form_tags')}</label>
                    <input type="text" className={inputClass} value={form.tags} onChange={set('tags')} placeholder="cattle, dry season, northern Kenya" />
                  </div>
                  <div>
                    <label className={labelClass}>{t('contribute.form_source')}</label>
                    <input type="text" className={inputClass} value={form.source} onChange={set('source')} placeholder="Elder name, oral tradition, year..." />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('contribute.form_location')}</label>
                  <select className={inputClass} value={form.locationId} onChange={set('locationId')}>
                    <option value="">No specific location</option>
                    {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* Step 3: Media & Submit */}
            {step === 3 && (
              <>
                <div>
                  <label className={labelClass}>Attach Media (photos, audio recordings, documents)</label>
                  <div className="border-2 border-dashed border-earth-200 rounded-xl p-8 text-center hover:border-savanna-300 transition-colors">
                    <div className="text-4xl mb-3">📎</div>
                    <p className="text-earth-500 text-sm mb-3">Upload images, audio, or video to accompany this knowledge</p>
                    <label className="btn-secondary cursor-pointer">
                      Choose File
                      <input type="file" className="hidden" accept="image/*,audio/*,video/*,.pdf" onChange={handleFileUpload} />
                    </label>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4">
                        <div className="h-1.5 bg-earth-100 rounded-full overflow-hidden">
                          <div className="h-full bg-savanna-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-xs text-earth-400 mt-1">{uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                  {uploadedMedia.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {uploadedMedia.map(m => (
                        <span key={m.id} className="badge bg-savanna-50 text-savanna-700">✓ {m.originalName}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-earth-50 rounded-xl p-5 border border-earth-200">
                  <h4 className="font-semibold text-earth-800 mb-3">Review Summary</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-earth-500">Title</dt><dd className="text-earth-800 font-medium">{form.title}</dd>
                    <dt className="text-earth-500">Category</dt><dd className="text-earth-800">{form.category}</dd>
                    <dt className="text-earth-500">Access Tier</dt><dd className="text-earth-800">{form.accessTier}</dd>
                    <dt className="text-earth-500">Media Files</dt><dd className="text-earth-800">{uploadedMedia.length}</dd>
                  </dl>
                </div>

                <div className="bg-savanna-50 border border-savanna-200 rounded-xl p-4 text-sm text-savanna-800">
                  <strong>Note:</strong> Your submission will be reviewed by community elders before being published. You will be notified of the outcome.
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-2 border-t border-earth-100">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary">{t('common.previous')}</button>
              ) : <div />}
              {step < 3 ? (
                <button type="button" onClick={() => setStep(s => s + 1)} className="btn-primary">{t('common.next')}</button>
              ) : (
                <button type="submit" disabled={isLoading} className="btn-primary px-8">
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
