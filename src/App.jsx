import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Game from './pages/Game'

// Todo el flujo (menu, tienda, niveles, ajustes, partida) vive dentro de
// Game.jsx como distintas "pantallas" internas, asi que una sola ruta basta.
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Game />} />
      </Routes>
    </Router>
  )
}

export default App
