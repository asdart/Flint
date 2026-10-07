import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import HomePage from "./pages/HomePage";
import CandidatesPage from "./pages/CandidatesPage";
import FacilityPartnersPage from "./pages/FacilityPartnersPage";
import BlogPage from "./pages/BlogPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import NotFoundPage from "./pages/NotFoundPage";
import StyleGuidePage from "./pages/StyleGuidePage";
import { siteSchema } from "./content/schema";

const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

/** x-schema-site: on Webflow this is site head code. In the preview it is appended once to <head>, so
 * `.fk-page` stays the first child of #root. */
function SiteSchema() {
  useEffect(() => {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(siteSchema());
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SiteSchema />
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
