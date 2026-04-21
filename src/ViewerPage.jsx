import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import SceneLoadFallback from "./components/SceneLoadFallback.jsx";
import Footer from "./components/Footer.jsx";

const ModelViewerSection = lazy(() => import("./components/ModelViewerSection.jsx"));

/**
 * Standalone 3D viewer route — only one WebGL context on this document (avoids mobile reload / OOM with hero + viewer).
 */
export default function ViewerPage() {
  return (
    <div id="top" className="min-h-dvh bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="text-sm font-medium text-zinc-300 transition hover:text-zinc-100"
          >
            ← Back to story
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">Firdaus · 3D</p>
        </div>
      </div>

      <Suspense fallback={<SceneLoadFallback label="Loading viewer…" className="min-h-[50dvh]" />}>
        <ModelViewerSection />
      </Suspense>

      <Footer />
    </div>
  );
}
