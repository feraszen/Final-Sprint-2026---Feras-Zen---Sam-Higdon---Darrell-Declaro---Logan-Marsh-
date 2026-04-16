import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { BrowserRouter } from "react-router-dom";
import ProductDetails from "../pages/ProductDetails";
import { CartProvider } from "../context/CartContext";

// Mock useParams because ProductDetails depends on the route id.
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "1" }),
  };
});

function mockFetchProduct(stockQuantity = 10) {
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
          stockQuantity,
        }),
    })
  );
}

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
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchProduct();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("renders stock information", async () => {
    renderPage();

    await screen.findByText(/mango juice/i);

  expect(screen.getByText(/Total Stock:/i)).toBeInTheDocument();
  expect(screen.getAllByText("10").length).toBeGreaterThan(0);

  expect(screen.getByText(/Remaining to Add:/i)).toBeInTheDocument();
  expect(screen.getAllByText("10").length).toBeGreaterThan(0);
  });

  it("renders extras buttons", async () => {
    renderPage();

    await screen.findByText(/mango juice/i);

    expect(screen.getByTitle(/Honey \+\$1.00/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Chocolate \+\$1.00/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Pistachio \+\$1.50/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Cream \+\$1.00/i)).toBeInTheDocument();
  });

  it("updates unit price when honey extra is selected", async () => {
    renderPage();

    await screen.findByText(/mango juice/i);

    fireEvent.click(screen.getByTitle(/Honey \+\$1.00/i));

    expect(screen.getByText(/Unit Price:\s*\$6.99/i)).toBeInTheDocument();
  });

  it("adds item to cart and shows success message", async () => {
    renderPage();

    await screen.findByText(/mango juice/i);

    fireEvent.click(screen.getByRole("button", { name: /add 1 to cart/i }));

    expect(
      await screen.findByText(/1 mango juice added to cart/i)
    ).toBeInTheDocument();
  });
});

