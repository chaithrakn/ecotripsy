import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ArticlePage from './pages/ArticlePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App