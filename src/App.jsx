import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import InspirationPage from './pages/InspirationPage'
import baliHotels from './data/bali-hotels.json'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/bali" element={
          <InspirationPage destinationId="bali-ubud" hotels={baliHotels} />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App