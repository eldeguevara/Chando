import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import RetailerPortal from './pages/RetailerPortal.jsx'
import InventoryCenter from './pages/InventoryCenter.jsx'
import ExecutiveDashboard from './pages/ExecutiveDashboard.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/minorista" element={<RetailerPortal />} />
      <Route path="/inventario" element={<InventoryCenter />} />
      <Route path="/ejecutivo" element={<ExecutiveDashboard />} />
    </Routes>
  )
}

export default App
