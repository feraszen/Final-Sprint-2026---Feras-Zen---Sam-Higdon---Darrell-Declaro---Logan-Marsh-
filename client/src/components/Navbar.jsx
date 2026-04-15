import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  // Read the total number of items currently stored in the cart.
  const { totalItems } = useCart();

  return (
    <header className="navbar">
      <div className="container nav-wrapper">
        {/* Logo section linking back to the homepage. */}
        <div className="logo-container">
          <NavLink to="/">
            <img
              src="/images/logo-header.png"
              alt="KeyTop Fresh Logo"
              className="logo"
            />
          </NavLink>
        </div>

        {/* Main navigation links for the public pages of the application. */}
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Home
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/menu"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Menu
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/order"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Order
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/about"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                About
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Admin
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Cart shortcut showing the current total item count. */}
        <div className="cart-icon">
          <NavLink to="/order">
            🛒 <span className="cart-count">{totalItems}</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

