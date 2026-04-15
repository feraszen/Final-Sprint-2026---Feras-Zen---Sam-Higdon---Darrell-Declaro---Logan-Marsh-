import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ProductDetails from "../pages/ProductDetails";
import { CartProvider } from "../context/CartContext";

// Mock useParams because the ProductDetails page depends on the route id.
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "1" }),
  };
});

// Mock fetch because ProductDetails loads product data from the API.
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        id: 1,
        name: "Mango Juice",
        price: 5.99,
        image: "/images/mango.jpg",
        category: "Fresh Juices",
        description: "Fresh mango drink",
        stockQuantity: 10,
      }),
  })
);

function renderPage() {
  return render(
    <CartProvider>
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    </CartProvider>
  );
}

describe("ProductDetails Page", () => {
  it("renders product name after fetch", async () => {
    renderPage();

    const productName = await screen.findByText(/mango juice/i);
    expect(productName).toBeInTheDocument();
  });

  it("renders product unit price", async () => {
    renderPage();

    const price = await screen.findByText(/Unit Price:\s*\$5.99/i);
    expect(price).toBeInTheDocument();
  });
});
