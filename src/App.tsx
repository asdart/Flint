import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import LegacyHomePage from "./pages/legacy/HomePage";
import FacilitiesPage from "./pages/legacy/FacilitiesPage";
import FacilityPartnersPage from "./pages/legacy/FacilityPartnersPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/legacy/BlogPostPage";
import AboutPage from "./pages/legacy/AboutPage";
import StyleGuidePage from "./pages/StyleGuidePage";

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen w-full min-w-0 flex-col items-center overflow-x-clip bg-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/legacy" element={<LegacyHomePage />} />
          <Route path="/candidates" element={<FacilitiesPage />} />
          <Route path="/facility-partners" element={<FacilityPartnersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog-categories/:slug" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/style-guide" element={<StyleGuidePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
