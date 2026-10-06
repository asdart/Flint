import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import HomePage from "./pages/HomePage";
import CandidatesPage from "./pages/CandidatesPage";
import FacilityPartnersPage from "./pages/FacilityPartnersPage";
import BlogPage from "./pages/BlogPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/facility-partners" element={<FacilityPartnersPage />} />
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
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/style-guide" element={<StyleGuidePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
