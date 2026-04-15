import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Login() {
  // Store the password input entered by the user.
  const [password, setPassword] = useState("");

  // Used to navigate the user after a successful login.
  const navigate = useNavigate();

  // Handle login submission and validate the admin password.
  function handleSubmit(e) {
    e.preventDefault();

    // Simple client-side authentication check (for demo purposes only).
    if (password === "admin123") {
      // Store admin session flag in localStorage.
      localStorage.setItem("isAdmin", "true");

      // Redirect to the admin dashboard after successful login.
      navigate("/admin");
    } else {
      alert("Incorrect password");
    }
  }

  return (
    <>
      <Navbar />

      <section className="menu-hero">
        <div className="container">
          <h1>Admin Login</h1>
          <p>Enter password to access the dashboard.</p>
        </div>
      </section>

      <main className="container" style={{ padding: "4rem 0" }}>
        {/* Login form used to authenticate the admin user. */}
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: "400px",
            margin: "0 auto",
            background: "#fff",
            padding: "2rem",
            borderRadius: "20px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          }}
        >
          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="checkout-btn">
            Login
          </button>
        </form>
      </main>
    </>
  );
}

export default Login;

