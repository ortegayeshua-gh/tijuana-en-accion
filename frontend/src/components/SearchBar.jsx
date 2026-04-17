import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react'; // Instalar con npm i lucide-react

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Efecto que aplica el "Debounce Inteligente" para buscar reportes
  useEffect(() => {
    // Definimos el temporizador
    const debounceTimer = setTimeout(() => {
      // Disparamos la búsqueda 500ms después de que el usuario dejó de teclear
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 500);

    // Función de limpieza de useEffect: se ejecuta cada vez que 'searchTerm' cambia
    // Esto significa que si el usuario teclea rápido antes de 500ms, limpiamos el timer
    // anterior y evitamos llamar a la API repetidamente.
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchTerm, onSearch]);

  return (
    <div className="relative max-w-xl w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow shadow-sm"
        placeholder="Buscar reportes (ej. Baches, Luminarias...)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        {searchTerm && (
           <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md animate-pulse">
             Escribiendo...
           </span>
        )}
      </div>
    </div>
  );
}
