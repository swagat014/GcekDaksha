import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

/* Common Components */
import Navbar from "./components/Navbar";
import DakshaHero from "./components/DakshaHero";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

/* Public Pages */
import Home from "./pages/Home";
import Register from "./pages/Register";
import Sports from "./pages/Sports";
import AccommodationForm from "./pages/AccommodationForm";

/* Admin Pages */
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAccommodation from "./pages/AdminAccommodation";

function App() {
  return (
    <Router>
      <div
        className="w-full min-h-screen"
        style={{
          background:
            "linear-gradient(135deg, #0a0514 0%, #1a0a2e 50%, #0d0520 100%)",
        }}
      >
        <AnimatePresence mode="wait">
          <Routes>
            {/* ================= PUBLIC WEBSITE ================= */}
            <Route
              path="/"
              element={
                <>
                  {/* <Navbar /> */}
                  <DakshaHero />

                  <main className="w-full">
                    <Home />
                    <Sports />

                    <div id="register" className="w-full">
                      <Register />
                    </div>

                    <div id="accommodation" className="w-full">
                      <AccommodationForm />
                    </div>

                    <Contact />
                  </main>

                  <Footer />
                </>
              }
            />

            
            {/* ================= ADMIN AUTH ================= */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ================= ADMIN DASHBOARD ================= */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* ================= ADMIN ACCOMMODATION ================= */}
            <Route
              path="/admin/accommodation"
              element={<AdminAccommodation />}
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
