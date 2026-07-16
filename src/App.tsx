import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import FacilitiesPage from "./pages/FacilitiesPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen w-full flex-col items-center bg-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/facility-partners" element={<FacilitiesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
