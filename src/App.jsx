import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import DakshaHero from './components/DakshaHero';
import Home from './pages/Home';
import Register from './pages/Register';
import Sports from './pages/Sports';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  // Opening animation removed - website loads directly

  return (
    <Router>
      <div className="w-full min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0514 0%, #1a0a2e 50%, #0d0520 100%)' }}>
        <AnimatePresence>
          <Routes>
            {/* Main website routes */}
            <Route path="/" element={
              <>
                {/* <Navbar /> */}
                <DakshaHero />
                <main className="w-full">
                  <Home />
                  <Sports />
                  <div id="register" className="w-full">
                    <Register />
                  </div>
                  <Contact />
                </main>
                <Footer />
              </>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
