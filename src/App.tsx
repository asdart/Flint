import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import HomePage from "./pages/HomePage";
import LegacyHomePage from "./pages/legacy/HomePage";
import CandidatesPage from "./pages/CandidatesPage";
import LegacyCandidatesPage from "./pages/legacy/FacilitiesPage";
import FacilityPartnersPage from "./pages/FacilityPartnersPage";
import LegacyFacilityPartnersPage from "./pages/legacy/FacilityPartnersPage";
import BlogPage from "./pages/BlogPage";
import LegacyBlogPostPage from "./pages/legacy/BlogPostPage";
import AboutPage from "./pages/legacy/AboutPage";
import StyleGuidePage from "./pages/StyleGuidePage";

const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));

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
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/legacy/candidates" element={<LegacyCandidatesPage />} />
          <Route path="/facility-partners" element={<FacilityPartnersPage />} />
          <Route path="/legacy/facility-partners" element={<LegacyFacilityPartnersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/categories/:slug" element={<BlogPage />} />
          <Route
            path="/blog/:slug"
            element={
              <Suspense fallback={null}>
                <BlogPostPage />
              </Suspense>
            }
          />
          <Route path="/legacy/blog/:slug" element={<LegacyBlogPostPage />} />
          <Route path="/style-guide" element={<StyleGuidePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
