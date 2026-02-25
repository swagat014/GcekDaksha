import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence, lazy, Suspense } from "framer-motion";

/* Common Components */
import Navbar from "./components/Navbar";
import DakshaHero from "./components/DakshaHero";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

/* Lazy Loaded Pages - Better Performance */
const Home = lazy(() => import("./pages/Home"));
const Register = lazy(() => import("./pages/Register"));
const Sports = lazy(() => import("./pages/Sports"));
const AccommodationForm = lazy(() => import("./pages/AccommodationForm"));

/* Admin Pages - Also Lazy */
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAccommodation = lazy(() => import("./pages/AdminAccommodation"));

/* Loading Component */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
  </div>
);

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
                    <Suspense fallback={<PageLoader />}>
                      <Home />
                    </Suspense>
                    <Suspense fallback={<PageLoader />}>
                      <Sports />
                    </Suspense>

                    <div id="register" className="w-full">
                      <Suspense fallback={<PageLoader />}>
                        <Register />
                      </Suspense>
                    </div>

                    <div id="accommodation" className="w-full">
                      <Suspense fallback={<PageLoader />}>
                        <AccommodationForm />
                      </Suspense>
                    </div>

                    <Contact />
                  </main>

                  <Footer />
                </>
              }
            />

            
            {/* ================= ADMIN AUTH ================= */}
            <Route 
              path="/admin" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminLogin />
                </Suspense>
              } 
            />
            <Route 
              path="/admin/login" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminLogin />
                </Suspense>
              } 
            />

            {/* ================= ADMIN DASHBOARD ================= */}
            <Route 
              path="/admin/dashboard" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboard />
                </Suspense>
              } 
            />

            {/* ================= ADMIN ACCOMMODATION ================= */}
            <Route
              path="/admin/accommodation"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminAccommodation />
                </Suspense>
              } 
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
