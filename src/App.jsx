import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import ArticlePage from './pages/ArticlePage'
import PlanATripPage from './pages/PlanATripPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminHome from './pages/admin/AdminHome'
import AdminEntityList from './components/admin/AdminEntityList'
import AdminEntityForm from './components/admin/AdminEntityForm'
import { ENTITIES } from './lib/admin/entityConfigs'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/plan-a-trip" element={<Layout><PlanATripPage /></Layout>} />
        <Route path="/articles/:slug" element={<ArticlePage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          {ENTITIES.map(entity => (
            <Route key={entity.table} path={entity.table} element={<AdminEntityList config={entity} />} />
          ))}
          {ENTITIES.map(entity => (
            <Route key={`${entity.table}-new`} path={`${entity.table}/new`} element={<AdminEntityForm config={entity} />} />
          ))}
          {ENTITIES.map(entity => (
            <Route key={`${entity.table}-edit`} path={`${entity.table}/:id`} element={<AdminEntityForm config={entity} />} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
