import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import NuevaDenuncia from './pages/NuevaDenuncia';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        {/* HEADER GLOBAL */}
        <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold tracking-tight hover:text-blue-100 transition">
              Tijuana en Acción
            </Link>
            <nav className="space-x-2 md:space-x-6 text-sm md:text-base">
              <Link to="/reportar" className="font-semibold px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-500 transition shadow-sm">Reportar</Link>
              <Link to="/admin" className="font-semibold text-blue-100 hover:text-white transition">Panel de Autoridad</Link>
            </nav>
          </div>
        </header>

        {/* CONTENIDO DINÁMICO */}
        <main className="flex-1 w-full relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reportar" element={<NuevaDenuncia />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>

        {/* FOOTER GLOBAL */}
        <footer className="bg-slate-900 text-slate-400 py-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h4 className="text-white font-bold mb-4 text-lg">¿Cómo funciona?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-sm">
              <div>
                <div className="font-bold text-white mb-2">1. Ubica el Problema</div>
                <p>El sistema usa tu GPS automáticamente para saber exactamente dónde se necesita atención.</p>
              </div>
              <div>
                <div className="font-bold text-white mb-2">2. Describe la falla</div>
                <p>Selecciona una categoría e indícanos detalles usando texto simple. Ahorramos tus datos móviles.</p>
              </div>
              <div>
                <div className="font-bold text-white mb-2">3. Seguimiento</div>
                <p>Total transparencia visualizando el reporte en el mapa público con colores según su estatus.</p>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-8 text-xs md:text-sm text-center">
              <p className="mb-2">&copy; 2026 Tijuana en Acción.</p>
              <p className="text-slate-300">
                Plataforma propuesta por <strong className="text-white">Memo Ortega</strong> Patria, Familia y Libertad 💙
              </p>
              <a 
                href="https://linktr.ee/ortegayeshua" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:text-blue-400 transition underline inline-block mt-2 font-bold"
              >
                https://linktr.ee/ortegayeshua
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
