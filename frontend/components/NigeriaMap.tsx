'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import api from '@/lib/api';

// Fix Leaflet's broken default icon paths in Next.js / webpack environments
// This prevents the "Cannot read properties of undefined (reading 'appendChild')" crash
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Dot {
  id: number;
  pos: [number, number];
  label: string;
  needs: number;
}

const STATE_COORDINATES: Record<string, [number, number]> = {
  "Abia": [5.5320, 7.4860],
  "Adamawa": [9.3265, 12.3984],
  "Akwa Ibom": [5.0073, 7.8485],
  "Anambra": [6.2104, 7.0699],
  "Bauchi": [10.3158, 9.8442],
  "Bayelsa": [4.7719, 6.0699],
  "Benue": [7.3369, 8.7404],
  "Borno": [11.8333, 13.1500],
  "Cross River": [5.8702, 8.5988],
  "Delta": [5.7040, 5.9339],
  "Ebonyi": [6.2649, 8.0137],
  "Edo": [6.5438, 5.8987],
  "Ekiti": [7.7190, 5.3110],
  "Enugu": [6.4402, 7.4943],
  "Federal Capital Territory": [9.0578, 7.4951],
  "FCT": [9.0578, 7.4951],
  "Gombe": [10.2897, 11.1711],
  "Imo": [5.5720, 7.0588],
  "Jigawa": [12.2280, 9.5616],
  "Kaduna": [10.5105, 7.4165],
  "Kano": [12.0022, 8.5920],
  "Katsina": [12.9816, 7.6223],
  "Kebbi": [12.4506, 4.1999],
  "Kogi": [7.7969, 6.7333],
  "Kwara": [8.9669, 4.3874],
  "Lagos": [6.5244, 3.3792],
  "Nasarawa": [8.5375, 8.5400],
  "Niger": [9.9309, 5.5983],
  "Ogun": [6.9980, 3.4737],
  "Ondo": [7.1000, 5.0500],
  "Osun": [7.5629, 4.5200],
  "Oyo": [8.1574, 3.6147],
  "Plateau": [9.2182, 9.5179],
  "Rivers": [4.8156, 7.0498],
  "Sokoto": [13.0609, 5.2390],
  "Taraba": [8.8937, 11.3596],
  "Yobe": [12.2939, 11.4390],
  "Zamfara": [12.1222, 6.2236]
};

export default function NigeriaMap() {
  const [densityData, setDensityData] = useState<Dot[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/needs/map');
        if (res.status === 200 || res.status === 304) {
          const data = res.data;
          const mappedData: Dot[] = data.map((item: any) => ({
            id: item.state,
            pos: STATE_COORDINATES[item.state] || [9.0820, 8.6753],
            label: item.state,
            needs: parseInt(item.needs, 10),
          }));
          setDensityData(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch map data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner relative z-0" style={{ minHeight: '288px' }}>
      <MapContainer
        center={[9.0820, 8.6753]}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', minHeight: '288px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {densityData.map((dot) => (
          <CircleMarker
            key={dot.id}
            center={dot.pos}
            radius={Math.min(Math.max(Math.sqrt(dot.needs) * 2, 5), 30)}
            pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.6 }}
          >
            <Popup className="font-bold text-green-700">
              {dot.label}: {dot.needs} Needs Shared
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
