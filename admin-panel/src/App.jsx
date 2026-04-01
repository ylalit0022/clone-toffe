import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import routes from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All admin pages share the AdminLayout (sidebar + navbar) */}
        <Route element={<AdminLayout />}>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}

          {/* Catch-all: redirect unknown paths to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
