import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from './context/AppContext.jsx'
import { PublicNav, AuthNav } from './components/Navbar.jsx'
import HelpButton from './components/HelpButton.jsx'
import StickyPrivacy from './components/StickyPrivacy.jsx'
import Spinner from './components/Spinner.jsx'

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
          <Route path="/" element={isAuthed ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/login" element={isAuthed ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/signup" element={isAuthed ? <Navigate to="/dashboard" replace /> : <SignUpPage />} />
          <Route path="/reset-password" element={isAuthed ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />} />
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
  const isAuthLoading = state.authStatus === 'loading'
  return (
    <BrowserRouter>
      {isAuthed ? <AuthNav /> : <PublicNav />}
      <main className="min-h-screen bg-neutral-50 overflow-x-hidden">
        {isAuthLoading ? (
          <div className="grid min-h-[60vh] place-content-center p-12">
            <div className="flex items-center gap-3 text-neutral-700">
              <Spinner />
              <span className="text-sm">Checking your session…</span>
            </div>
          </div>
        ) : (
          <AnimatedRoutes />
        )}
      </main>
      <HelpButton />
      <StickyPrivacy />
    </BrowserRouter>
  )
}

export default function App(){
  return <Shell />
}