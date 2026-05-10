import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { locationApi } from '../services/api';
import { PageHeader, Spinner } from '../components/common/UI';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TYPE_COLORS = {
  GRAZING_LAND: '#538C1A', WATER_POINT: '#1A6EB8', MIGRATION_ROUTE: '#C44420',
  SACRED_SITE: '#8B6F35', SETTLEMENT: '#6E5528', MARKET: '#A08B2A',
  CONFLICT_ZONE: '#B22222', CONSERVATION_AREA: '#2D6E4E', OTHER: '#888',
};

const LOCATION_TYPES = ['GRAZING_LAND','WATER_POINT','MIGRATION_ROUTE','SACRED_SITE','SETTLEMENT','MARKET','CONSERVATION_AREA'];

export default function MapPage() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { data: geojson, isLoading } = useQuery({
    queryKey: ['locations-geojson', selectedType],
    queryFn: () => locationApi.geojson(selectedType ? { locationType: selectedType } : {}).then(r => r.data),
  });

  const features = geojson && geojson.features ? geojson.features : [];
  const center = [1.2921, 36.8219];

  return (
    <div>
      <PageHeader title={t('map.title')} subtitle={t('map.subtitle')} />
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>

        {/* Filter pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <button onClick={() => setSelectedType('')}
            style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', border: 'none', background: !selectedType ? '#3A700D' : '#EDE4D3', color: !selectedType ? 'white' : '#523D1C' }}>
            {t('map.all_types')}
          </button>
          {LOCATION_TYPES.map(type => (
            <button key={type} onClick={() => setSelectedType(type === selectedType ? '' : type)}
              style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', border: 'none', background: selectedType === type ? TYPE_COLORS[type] : '#EDE4D3', color: selectedType === type ? 'white' : '#523D1C' }}>
              {t('map.location_types.' + type)}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>

          {/* Map */}
          <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid #EDE4D3', height: '520px' }}>
            {isLoading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#F7F3ED' }}><Spinner /></div> : (
              <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {features.map((f, i) => {
                  const [lng, lat] = f.geometry.coordinates;
                  const color = TYPE_COLORS[f.properties.locationType] || '#888';
                  return (
                    <CircleMarker key={i} center={[lat, lng]} radius={10}
                      pathOptions={{ color: 'white', fillColor: color, fillOpacity: 0.9, weight: 2 }}
                      eventHandlers={{ click: () => setSelectedLocation(f.properties) }}>
                      <Popup>
                        <div style={{ minWidth: '160px', fontFamily: 'Source Sans 3, sans-serif' }}>
                          <div style={{ fontWeight: 600, color: '#1A1008', marginBottom: '0.25rem' }}>{f.properties.name}</div>
                          {f.properties.nameSwahili && <div style={{ color: '#8B6F35', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{f.properties.nameSwahili}</div>}
                          <div style={{ fontSize: '0.8rem', color: '#6E5528' }}>{t('map.location_types.' + f.properties.locationType)}</div>
                          {f.properties.community && <div style={{ fontSize: '0.75rem', color: '#A88B50', marginTop: '0.25rem' }}>{f.properties.community}</div>}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Legend */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 600, color: '#1A1008', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Legend</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {LOCATION_TYPES.map(type => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', flexShrink: 0, background: TYPE_COLORS[type] }} />
                    <span style={{ color: '#523D1C' }}>{t('map.location_types.' + type)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location list */}
            <div className="card" style={{ padding: '1.25rem', overflowY: 'auto', maxHeight: '320px' }}>
              <h3 style={{ fontWeight: 600, color: '#1A1008', marginBottom: '0.75rem', fontSize: '0.875rem' }}>{features.length} Locations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {features.map((f, i) => (
                  <button key={i} onClick={() => setSelectedLocation(f.properties)}
                    style={{ textAlign: 'left', padding: '0.5rem 0.625rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: selectedLocation && selectedLocation.id === f.properties.id ? '#F0F7E6' : 'transparent', transition: 'background 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', flexShrink: 0, background: TYPE_COLORS[f.properties.locationType] }} />
                      <span style={{ fontWeight: 500, color: '#1A1008', fontSize: '0.875rem' }}>{f.properties.name}</span>
                    </div>
                    <div style={{ color: '#A88B50', fontSize: '0.75rem', marginTop: '0.125rem', marginLeft: '1.125rem' }}>{t('map.location_types.' + f.properties.locationType)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
