import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Order from "./pages/Order";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";

// Protect admin-only routes by checking the admin flag in localStorage.
function ProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem("isAdmin");

  // Redirect unauthenticated users to the login page.
  if (!isAdmin) {
    return <Navigate to="/login" />;
  }

  // Render the protected content if the user is authenticated as admin.
  return children;
}

function App() {
  return (
    <BrowserRouter>
      {/* Define all client-side routes for the application. */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/order" element={<Order />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />

        {/* Product details page for a single selected product. */}
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* Admin dashboard route protected by the custom ProtectedRoute wrapper. */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

