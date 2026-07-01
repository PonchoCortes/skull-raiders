import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Game from './pages/Game'
import MainMenu from './pages/MainMenu'
import LevelSelection from './pages/LevelSelection' // 1. Importamos la nueva página

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/levels" element={<LevelSelection />} /> {/* 2. Añadimos la ruta */}
        <Route path="/game/:level" element={<Game />} />
        <Route path="*" element={<MainMenu />} />
      </Routes>
    </Router>
  )
}

export default App