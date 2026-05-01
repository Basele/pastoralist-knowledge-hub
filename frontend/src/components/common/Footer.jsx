import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-earth-900 text-earth-200 mt-16">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-savanna-600 flex items-center justify-center text-white font-display font-bold">P</div>
              <span className="font-display text-white font-semibold">Pastoralist Knowledge Hub</span>
            </div>
            <p className="text-sm text-earth-400 leading-relaxed">
              Preserving and sharing indigenous pastoralist knowledge across generations and communities.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Explore</h4>
            <div className="flex flex-col gap-2">
              {[['/', t('nav.home')], ['/knowledge', t('nav.knowledge')], ['/map', t('nav.map')], ['/community', t('nav.community')]].map(([to, label]) => (
                <Link key={to} to={to} className="text-sm text-earth-400 hover:text-earth-200 transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">About</h4>
            <p className="text-sm text-earth-400 leading-relaxed">
              Community-owned. Culturally sensitive. Built with respect for indigenous data sovereignty.
            </p>
            <p className="text-xs text-earth-600 mt-4">© {new Date().getFullYear()} Pastoralist Knowledge Hub</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
