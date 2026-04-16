import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { CartProvider } from "../context/CartContext";

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

  it("renders extras buttons", () => {
    renderProductCard();

    expect(screen.getByTitle(/Honey \+\$1.00/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Chocolate \+\$1.00/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Pistachio \+\$1.50/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Cream \+\$1.00/i)).toBeInTheDocument();
  });

  it("updates displayed price when an extra is selected", () => {
    renderProductCard();

    fireEvent.click(screen.getByTitle(/Honey \+\$1.00/i));

    expect(screen.getByText("$6.99")).toBeInTheDocument();
  });

  it("renders view details link with correct product route", () => {
    renderProductCard();

    const detailsLink = screen.getByRole("link", { name: /view details/i });
    expect(detailsLink).toBeInTheDocument();
    expect(detailsLink).toHaveAttribute("href", "/product/1");
  });

  it("adds product to cart when add to cart button is clicked", () => {
  renderProductCard();

  const addButton = screen.getByRole("button", { name: /add to cart/i });
  fireEvent.click(addButton);

  expect(addButton).toBeInTheDocument();
  });
});

