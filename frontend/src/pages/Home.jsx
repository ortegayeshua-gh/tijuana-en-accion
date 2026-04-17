import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapaView from '../components/MapaView';

export default function Home() {
  const [allReportes, setAllReportes] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  const CATEGORIAS_OPCIONES = [
    { value: 'Todas', label: 'Todos los Rubros' },
    { value: 'Alumbrado_Publico', label: 'Alumbrado Público' },
    { value: 'Limpia_y_Recoleccion', label: 'Limpia y Recolección' },
    { value: 'Vialidades_y_Urbanismo', label: 'Vialidades y Urbanismo' },
    { value: 'Control_Ambiental', label: 'Control Ambiental' },
    { value: 'Sindicatura_Corrupcion', label: 'Sindicatura (Corrupción)' },
  ];

  // Reemplazamos los mock datas antiguos por una llamada real al servidor de Render
  const fetchReportes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://tijuana-en-accion.onrender.com'}/api/reportes`);
      if (response.ok) {
        const data = await response.json();
        setAllReportes(data);
        setReportes(data);
      }
    } catch (error) {
      console.error("Error cargando el mapa de reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  // Lógica para filtrar cuando cambia la categoría
  useEffect(() => {
    if (categoriaFiltro === 'Todas') {
      setReportes(allReportes);
    } else {
      setReportes(allReportes.filter(r => r.categoria === categoriaFiltro));
    }
  }, [categoriaFiltro, allReportes]);

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 space-y-6">
      {/* HERO SECTION */}
      <section className="text-center py-8 space-y-4">
        <h2 className="text-4xl font-extrabold text-slate-800">Reporta y Mejora tu Ciudad</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Ayuda a mantener la ciudad limpia y segura reportando problemas en servicios públicos. No necesitas subir fotos, solo ubicarnos e informarnos.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Link to="/reportar" className="bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-red-700 hover:-translate-y-0.5 transition-all">
            Realizar denuncia ciudadana
          </Link>
          <a href="#mapa-publico" className="bg-white text-slate-800 border-2 border-slate-200 font-bold py-3 px-6 rounded-full shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all">
            Ver Mapa Público
          </a>
        </div>
      </section>

      {/* MAPA Y BUSCADOR */}
      <section id="mapa-publico" className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-2 gap-4">
          <h3 className="text-xl font-bold text-slate-700">Explorar Reportes</h3>
          <div className="flex-1 w-full max-w-sm md:ml-4">
            <select 
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 shadow-sm font-semibold"
            >
              {CATEGORIAS_OPCIONES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-500 font-bold">
            Cargando el mapa de la ciudad...
          </div>
        ) : (
          <MapaView reportes={reportes} />
        )}
      </section>
    </div>
  );
}
