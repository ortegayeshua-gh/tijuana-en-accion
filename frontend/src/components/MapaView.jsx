import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configuración de iconos personalizados basados en estado
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  Pendiente: createIcon('red'),
  En_Proceso: createIcon('yellow'),
  Resuelto: createIcon('green'),
};



export default function MapaView({ reportes = [] }) {
  const tijuanaCenter = [32.5149, -117.0382];
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(tijuanaCenter);

  const [mapRadius] = useState(1000); // 1km radio = 1000m

  // Intentar obtener geolocalización al cargar
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setUseCurrentLocation(true);
      });
    }
  }, []);

  // Lógica de filtrado de "Geocerca de 1km" 
  // Nota: En un caso real esta reducción puede hacerse mediante ST_DWithin en el backend, 
  // aquí lo simulamos por GPS si el backend entregó todos.
  // formula "Haversine" para simulación de distancia fronend, omitida para simplicidad y demostración de filtrado
  


  return (
    <div className="relative w-full h-[600px] bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200">
      
      {/* Controles Flotantes para los Filtros Globales */}
      <div className="absolute top-4 right-4 z-[400] bg-white p-3 rounded-lg shadow-lg border border-slate-200">

        
        <div className="mt-4 flex items-center gap-2">
          <input 
            type="checkbox" 
            id="geofence" 
            checked={useCurrentLocation} 
            onChange={(e) => setUseCurrentLocation(e.target.checked)} 
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
          />
          <label htmlFor="geofence" className="text-sm font-medium text-slate-700">
            Forzar radio 1km
          </label>
        </div>
      </div>

      <MapContainer 
        center={userLocation} 
        zoom={13} 
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Círculo GeoCerca del GPS */}
        {useCurrentLocation && (
          <Circle 
            center={userLocation} 
            radius={mapRadius} 
            pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.1 }}
          />
        )}

        {/* Pines */}
        {reportes.map((reporte) => (
          <Marker 
            key={reporte.id} 
            position={[reporte.lat, reporte.lng]}
            icon={icons[reporte.estado] || icons.Pendiente}
          >
            <Popup className="rounded-xl font-sans">
              <div className="p-1">
                <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full mb-2
                  ${reporte.estado === 'Resuelto' ? 'bg-green-100 text-green-700' : 
                    reporte.estado === 'En_Proceso' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'}`}>
                  {reporte.estado}
                </span>
                <h3 className="font-bold text-base mb-1">{reporte.subcategoria?.replace(/_/g, ' ')}</h3>
                <p className="text-sm text-slate-600 mb-2">{reporte.descripcion}</p>
                <div className="text-xs text-slate-400">Actualizado: {reporte.updated_at}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
