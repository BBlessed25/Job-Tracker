import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext.jsx'
import { PublicNav, AuthNav } from './components/Navbar.jsx'
import HelpButton from './components/HelpButton.jsx'
import StickyPrivacy from './components/StickyPrivacy.jsx'

import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import JobBoardPage from './pages/JobBoardPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'

function AnimatedRoutes(){
  const location = useLocation()
  const { state } = useApp()
  const isAuthed = state.authStatus === 'authenticated'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/reset" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={isAuthed ? <DashboardPage /> : <Navigate to="/login" replace />} />
          <Route path="/board" element={isAuthed ? <JobBoardPage /> : <Navigate to="/login" replace />} />
          <Route path="/settings" element={isAuthed ? <SettingsPage /> : <Navigate to="/login" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function Shell(){
  const { state } = useApp()
  const isAuthed = state.authStatus === 'authenticated'
  return (
    <BrowserRouter>
      {isAuthed ? <AuthNav /> : <PublicNav />}
      <main className="min-h-screen bg-neutral-50">
        <AnimatedRoutes />
      </main>
      <HelpButton />
      <StickyPrivacy />
    </BrowserRouter>
  )
}

export default function App(){
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}