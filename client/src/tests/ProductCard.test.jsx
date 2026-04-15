import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { CartProvider } from "../context/CartContext";

// Mock product data used for testing
const mockProduct = {
  id: 1,
  name: "Mango Juice",
  price: 5.99,
  image: "/images/mango.jpg",
  category: "Fresh Juices",
};

function renderProductCard() {
  return render(
    <CartProvider>
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    </CartProvider>
  );
}

describe("ProductCard Component", () => {
  it("renders product name correctly", () => {
    renderProductCard();

    expect(screen.getByText("Mango Juice")).toBeInTheDocument();
  });

  it("renders product price correctly", () => {
    renderProductCard();

    expect(screen.getByText("$5.99")).toBeInTheDocument();
  });
});
