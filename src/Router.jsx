import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import App from "./App.jsx";
import ViewerPage from "./ViewerPage.jsx";

/** Old in-page hash links: send `/…#viewer` to the dedicated viewer route. */
function LegacyHashRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.location.hash !== "#viewer") return;
    const { pathname, search } = window.location;
    window.history.replaceState(null, "", `${pathname}${search}`);
    navigate("/viewer", { replace: true });
  }, [navigate]);
  return null;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <LegacyHashRedirect />
              <App />
            </>
          }
        />
        <Route path="/viewer" element={<ViewerPage />} />
      </Routes>
    </BrowserRouter>
  );
}
