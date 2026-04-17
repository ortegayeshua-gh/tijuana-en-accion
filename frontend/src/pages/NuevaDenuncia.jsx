import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CATEGORIAS = {
  Alumbrado_Publico: ['Reparacion_Luminaria', 'Solicitud_Nueva_Luminaria', 'Luminaria_Dia', 'Poste_Peligro', 'Robo_Cableado'],
  Limpia_y_Recoleccion: ['Falta_Recoleccion', 'Basurero_Clandestino', 'Recoleccion_Pesada', 'Animal_Muerto', 'Limpieza_Grafiti'],
  Vialidades_y_Urbanismo: ['Bacheo', 'Solicitud_Topes', 'Rejilla_Danada', 'Semaforo_Descompuesto', 'Senalamiento_Danado', 'Pintura_Trafico'],
  Control_Ambiental: ['Poda_Tala', 'Ruido_Excesivo', 'Maltrato_Animal', 'Derrame_Aguas', 'Mantenimiento_Parques'],
  Sindicatura_Corrupcion: ['Abuso_Autoridad', 'Soborno', 'Negligencia', 'Maltrato_Ciudadano', 'Uso_Indebido_Recursos']
};

export default function NuevaDenuncia() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    categoria: '',
    subcategoria: '',
    descripcion: '',
    lat: null,
    lng: null
  });
  const [gpsStatus, setGpsStatus] = useState('Pendiente');
  const [sending, setSending] = useState(false);

  // Ubicar al ciudadano
  const obtenerUbicacion = () => {
    setGpsStatus('Buscando...');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
          setGpsStatus('¡Ubicación Obtenida!');
        },
        (error) => {
          setGpsStatus('Error al obtener ubicación. Asegúrate de dar permisos.');
        }
      );
    } else {
      setGpsStatus('Tu navegador no soporta GPS.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      alert("Por favor, obtén tu ubicación primero haciendo clic en el botón del paso 1.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://tijuana-en-accion.onrender.com'}/api/reportes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert("¡Denuncia enviada exitosamente!");
        navigate('/'); // Volver al inicio/mapa
      } else {
        const errorData = await response.json();
        alert("Error al enviar denuncia: " + (errorData.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error(error);
      alert("Problema de conexión con el servidor.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <Link to="/" className="text-blue-600 font-bold hover:underline mb-4 inline-block">&larr; Volver al Mapa</Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h2 className="text-3xl font-extrabold text-slate-800 mb-6">Nueva Denuncia Ciudadana</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PASO 1: GPS */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-2">1. Tu Ubicación Exacta (Obligatorio)</h3>
            <p className="text-sm text-slate-600 mb-4">No necesitas foto, solo dinos en dónde ocurre el problema apoyándote de tu GPS.</p>
            <button 
              type="button" 
              onClick={obtenerUbicacion}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition"
            >
              Obtener mi ubicación actual
            </button>
            <span className={`ml-3 text-sm font-semibold ${gpsStatus.includes('Obtenida') ? 'text-green-600' : 'text-amber-500'}`}>
              {gpsStatus}
            </span>
          </div>

          {/* PASO 2: CATEGORIA */}
          <div>
            <h3 className="font-bold text-slate-700 mb-2">2. Clasifica el Problema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Categoría</label>
                <select 
                  required
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value, subcategoria: ''})}
                >
                  <option value="">Selecciona una categoría...</option>
                  {Object.keys(CATEGORIAS).map(cat => (
                    <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              {formData.categoria && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subcategoría</label>
                  <select 
                    required
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                    value={formData.subcategoria}
                    onChange={(e) => setFormData({...formData, subcategoria: e.target.value})}
                  >
                    <option value="">Detalla el problema...</option>
                    {CATEGORIAS[formData.categoria].map(sub => (
                      <option key={sub} value={sub}>{sub.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* PASO 3: DESCRIPCIÓN */}
          <div>
            <h3 className="font-bold text-slate-700 mb-2">3. Describe la Falla</h3>
            <textarea 
              required
              rows={4}
              placeholder="Ej: Hay un bache profundo causando daños a los carros o el poste número 12 está completamente apagado..."
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-3"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={sending || !formData.lat}
            className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {sending ? 'Enviando reporte...' : 'Enviar Reporte Oficial'}
          </button>
        </form>
      </div>
    </div>
  );
}
