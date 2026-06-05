import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Game from './pages/Game'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="*" element={<Game />} />
      </Routes>
    </Router>
  )
}

export default App
