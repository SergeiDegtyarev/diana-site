import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Works from './pages/Works';
import WorkDetail from './pages/WorkDetail';
import Biography from './pages/Biography';
import Contacts from './pages/Contacts';
import Admin from './pages/Admin';
import PageLayout from './components/PageLayout';

function App() {
  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <ScrollToTop />
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/works" element={<Works />} />
          <Route path="/works/:slug" element={<WorkDetail />} />
          <Route path="/biography" element={<Biography />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App
