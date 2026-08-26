import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import ArticlePage from './pages/ArticlePage'
import PlanATripPage from './pages/PlanATripPage'
import JournalEntryPage from './pages/JournalEntryPage'
import JournalListPage from './pages/JournalListPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SavedItineraryPage from './pages/SavedItineraryPage'
import SavedPage from './pages/SavedPage'
import TripsPage from './pages/TripsPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminHome from './pages/admin/AdminHome'
import AdminEntityList from './components/admin/AdminEntityList'
import AdminEntityForm from './components/admin/AdminEntityForm'
import ItineraryTemplateList from './pages/admin/ItineraryTemplateList'
import ItineraryTemplateForm from './pages/admin/ItineraryTemplateForm'
import ContentPageList from './pages/admin/ContentPageList'
import ContentPageForm from './pages/admin/ContentPageForm'
import { ENTITIES } from './lib/admin/entityConfigs'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/plan-a-trip" element={<Layout><PlanATripPage /></Layout>} />
        <Route path="/journal" element={<Layout><JournalListPage /></Layout>} />
        <Route path="/journal/:slug" element={<Layout><JournalEntryPage /></Layout>} />
        <Route path="/login" element={<Layout><LoginPage /></Layout>} />
        <Route path="/signup" element={<Layout><SignupPage /></Layout>} />
        <Route path="/saved-itineraries/:id" element={<Layout><SavedItineraryPage /></Layout>} />
        <Route path="/saved" element={<Layout><SavedPage /></Layout>} />
        <Route path="/trips" element={<Layout><TripsPage /></Layout>} />
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
          <Route path="itinerary_templates" element={<ItineraryTemplateList />} />
          <Route path="itinerary_templates/new" element={<ItineraryTemplateForm />} />
          <Route path="itinerary_templates/:id" element={<ItineraryTemplateForm />} />
          <Route path="content_pages" element={<ContentPageList />} />
          <Route path="content_pages/new" element={<ContentPageForm />} />
          <Route path="content_pages/:id" element={<ContentPageForm />} />
        </Route>
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
