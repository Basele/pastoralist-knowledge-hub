import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { locationApi } from '../services/api';
import { PageHeader } from '../components/common/UI';
import { Link } from 'react-router-dom';
import L from 'leaflet';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TYPE_COLORS = {
  GRAZING_LAND:      '#538C1A',
  WATER_POINT:       '#1A6EB8',
  MIGRATION_ROUTE:   '#C44420',
  SACRED_SITE:       '#8B6F35',
  SETTLEMENT:        '#6E5528',
  MARKET:            '#A08B2A',
  CONFLICT_ZONE:     '#B22222',
  CONSERVATION_AREA: '#2D6E4E',
  OTHER:             '#888',
};

const LOCATION_TYPES = [
  'GRAZING_LAND','WATER_POINT','MIGRATION_ROUTE','SACRED_SITE',
  'SETTLEMENT','MARKET','CONSERVATION_AREA',
];

export default function MapPage() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { data: geojson, isLoading } = useQuery({
    queryKey: ['locations-geojson', selectedType],
    queryFn: () => locationApi.geojson(selectedType ? { locationType: selectedType } : {}).then(r => r.data),
  });

  const features = geojson?.features || [];

  // East Africa center
  const center = [1.2921, 36.8219];

  return (
    <div>
      <PageHeader
        title={t('map.title')}
        subtitle={t('map.subtitle')}
      />

      <div className="page-container py-6">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedType('')}
            className={`badge cursor-pointer text-sm px-3 py-1.5 ${!selectedType ? 'bg-savanna-600 text-white' : 'bg-earth-100 text-earth-700 hover:bg-earth-200'}`}
          >
            {t('map.all_types')}
          </button>
          {LOCATION_TYPES.map(type => (
            <button key={type}
              onClick={() => setSelectedType(type === selectedType ? '' : type)}
              className={`badge cursor-pointer text-sm px-3 py-1.5 transition-colors ${selectedType === type ? 'text-white' : 'bg-earth-100 text-earth-700 hover:bg-earth-200'}`}
              style={selectedType === type ? { backgroundColor: TYPE_COLORS[type] } : {}}
            >
              {t(`map.location_types.${type}`)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-earth-100 shadow-sm" style={{ height: '520px' }}>
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
                    eventHandlers={{ click: () => setSelectedLocation(f.properties) }}
                  >
                    <Popup>
                      <div className="min-w-[160px]">
                        <div className="font-semibold text-earth-900 mb-1">{f.properties.name}</div>
                        {f.properties.nameSwahili && <div className="text-earth-500 text-xs mb-1">{f.properties.nameSwahili}</div>}
                        <div className="text-xs text-earth-500">{t(`map.location_types.${f.properties.locationType}`)}</div>
                        {f.properties.community && <div className="text-xs text-earth-400 mt-1">{f.properties.community}</div>}
                        {f.properties.isSeasonalWater && (
                          <div className="text-xs text-sky-600 mt-1">💧 Seasonal: {f.properties.seasonAvailable}</div>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Legend */}
            <div className="card p-5">
              <h3 className="font-semibold text-earth-800 mb-3 text-sm">Legend</h3>
              <div className="flex flex-col gap-2">
                {LOCATION_TYPES.map(type => (
                  <div key={type} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[type] }} />
                    <span className="text-earth-600">{t(`map.location_types.${type}`)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location list */}
            <div className="card p-5 flex-1 overflow-y-auto max-h-72">
              <h3 className="font-semibold text-earth-800 mb-3 text-sm">{features.length} Locations</h3>
              {isLoading ? (
                <p className="text-earth-400 text-sm">Loading...</p>
              ) : features.length === 0 ? (
                <p className="text-earth-400 text-sm">No locations found.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {features.map((f, i) => (
                    <button key={i}
                      onClick={() => setSelectedLocation(f.properties)}
                      className={`text-left p-2.5 rounded-lg text-sm transition-colors ${selectedLocation?.id === f.properties.id ? 'bg-savanna-50 border border-savanna-200' : 'hover:bg-earth-50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[f.properties.locationType] }} />
                        <span className="font-medium text-earth-800">{f.properties.name}</span>
                      </div>
                      <div className="text-earth-400 text-xs mt-0.5 ml-4">{t(`map.location_types.${f.properties.locationType}`)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
