import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LevelSelection() {
  const navigate = useNavigate();
  // Generamos los 100 niveles
  const levels = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-black text-amber-500 mb-8 mt-4" style={{ fontFamily: 'Georgia, serif' }}>
        SELECCIÓN DE NIVEL
      </h1>
      
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 w-full max-w-4xl">
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => navigate(`/game/${lvl}`)}
            className="aspect-square bg-slate-800 border-2 border-slate-700 hover:border-amber-400 rounded-lg flex items-center justify-center font-bold text-white transition-all hover:bg-slate-700 hover:scale-105 active:scale-95"
          >
            {lvl}
          </button>
        ))}
      </div>

      <button 
        onClick={() => navigate('/')} 
        className="mt-10 px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition"
      >
        VOLVER AL MENÚ
      </button>
    </div>
  );
}