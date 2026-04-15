import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Navbar from "../components/Navbar";
import { CartProvider } from "../context/CartContext";

function renderNavbar() {
  return render(
    <CartProvider>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </CartProvider>
  );
}

describe("Navbar Component", () => {
  it("renders navigation links", () => {
    renderNavbar();

    // Check if main navigation links exist
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/menu/i)).toBeInTheDocument();
    expect(screen.getByText(/order/i)).toBeInTheDocument();
  });

  it("displays cart count", () => {
    renderNavbar();

    // Assuming cart count starts at 0
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});
