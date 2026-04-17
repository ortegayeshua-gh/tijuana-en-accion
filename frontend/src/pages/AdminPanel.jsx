import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminPanel() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [token, setToken] = useState('Proyecto2027'); 
  const VIP_TOKEN = process.env.VITE_ADMIN_TOKEN || 'Proyecto2027'; // Contraseña demostración

  // Sistema de Login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (user === 'Tijuana' && password === 'Proyecto2027') {
      setIsLoggedIn(true);
    } else {
      alert("Credenciales incorrectas.");
    }
  };

  const fetchReportes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://tijuana-en-accion.onrender.com'}/api/reportes`);
      if (response.ok) {
        const data = await response.json();
        setReportes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const handlePurge = async () => {
    if(!window.confirm("¿Estás seguro de eliminar permanentemente los reportes resueltos con más de 7 días?")) return;
    
    setPurging(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://tijuana-en-accion.onrender.com'}/api/admin/purge`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if(response.ok) {
        alert(`Éxito: Se eliminaron ${result.borrados_count} registros anticuados.`);
        fetchReportes(); 
      } else {
        alert(`Fallo: ${result.error}`);
      }
    } catch(e) {
      alert("Error de red.");
    } finally {
      setPurging(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Acceso Restringido</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Usuario</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
              value={user} 
              onChange={(e) => setUser(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
            Entrar al Panel
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-blue-500 hover:underline">&larr; Volver al Inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panel de Autoridad</h2>
          <p className="text-sm text-slate-500">Gestión de Folios y Mantenimiento de Datos</p>
        </div>
        <Link to="/" className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition">Ir al Mapa Público &rarr;</Link>
      </div>

      {/* Tarjeta de Purga de Base de Datos */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <h3 className="text-red-800 font-bold text-lg mb-1">Mantenimiento y Ahorro de Servidor</h3>
          <p className="text-red-700 text-sm max-w-xl">
            Ejecutar limpieza de la base de datos de reportes <b>Resueltos</b> cuya última actividad tenga más de 7 días de antigüedad. Libera almacenamiento y mantiene la PWA ágil.
          </p>
        </div>
        <button 
          onClick={handlePurge}
          disabled={purging}
          className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-sm font-bold hover:bg-red-700 w-full md:w-auto disabled:opacity-50"
        >
          {purging ? 'Destruyendo registros...' : 'Ejecutar Purga de 7 días'}
        </button>
      </div>

      {/* Tabla de Registros Crudos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Folio</th>
                <th className="p-4 font-bold">Categoría</th>
                <th className="p-4 font-bold">Prioridad</th>
                <th className="p-4 font-bold">Estatus</th>
                <th className="p-4 font-bold">Fecha</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-500">Cargando reportes desde Render...</td></tr>
              ) : reportes.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-500">No hay reportes en la base de datos.</td></tr>
              ) : (
                reportes.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-4 font-mono text-slate-500">#{r.id}</td>
                    <td className="p-4">
                      <div className="font-bold">{r.subcategoria?.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-slate-400">{r.categoria?.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        r.prioridad === 'Alta' ? 'bg-red-100 text-red-700' : 
                        r.prioridad === 'Media' ? 'bg-amber-100 text-amber-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {r.prioridad}
                      </span>
                    </td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        r.estado === 'Resuelto' ? 'bg-green-100 text-green-700' : 
                        r.estado === 'En_Proceso' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(r.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
