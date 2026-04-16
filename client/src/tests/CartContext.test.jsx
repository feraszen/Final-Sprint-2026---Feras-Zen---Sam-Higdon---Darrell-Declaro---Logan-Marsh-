import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { CartProvider, useCart } from "../context/CartContext";

function TestCartComponent() {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    deleteFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  const sampleProduct = {
    id: 1,
    name: "Mango Juice",
    price: 5.99,
    basePrice: 5.99,
    image: "/images/mango.jpg",
    category: "Fresh Juices",
    extras: [],
  };

  return (
    <div>
      <p>Total Items: {totalItems}</p>
      <p>Total Price: {totalPrice.toFixed(2)}</p>
      <p>Cart Length: {cartItems.length}</p>

      <button onClick={() => addToCart(sampleProduct)}>Add Product</button>
      <button onClick={() => removeFromCart(sampleProduct)}>Remove One</button>
      <button onClick={() => deleteFromCart(sampleProduct)}>Delete Item</button>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}

function renderCartTest() {
  return render(
    <CartProvider>
      <TestCartComponent />
    </CartProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("CartContext", () => {
  it("adds product to cart and updates totals", () => {
    renderCartTest();

    fireEvent.click(screen.getByRole("button", { name: /add product/i }));

    expect(screen.getByText(/Total Items: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Price: 5.99/i)).toBeInTheDocument();
    expect(screen.getByText(/Cart Length: 1/i)).toBeInTheDocument();
  });

  it("removes one product from cart", () => {
    renderCartTest();

    fireEvent.click(screen.getByRole("button", { name: /add product/i }));
    fireEvent.click(screen.getByRole("button", { name: /remove one/i }));

    expect(screen.getByText(/Total Items: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Price: 0.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Cart Length: 0/i)).toBeInTheDocument();
  });

  it("deletes item from cart completely", () => {
    renderCartTest();

    fireEvent.click(screen.getByRole("button", { name: /add product/i }));
    fireEvent.click(screen.getByRole("button", { name: /add product/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete item/i }));

    expect(screen.getByText(/Total Items: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Price: 0.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Cart Length: 0/i)).toBeInTheDocument();
  });

  it("clears the cart", () => {
    renderCartTest();

    fireEvent.click(screen.getByRole("button", { name: /add product/i }));
    fireEvent.click(screen.getByRole("button", { name: /clear cart/i }));

    expect(screen.getByText(/Total Items: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Price: 0.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Cart Length: 0/i)).toBeInTheDocument();
  });
});
