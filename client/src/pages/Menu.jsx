import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

function Menu() {
  // Store all products loaded from the mock backend.
  const [products, setProducts] = useState([]);

  // Control loading and error states during the fetch process.
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all products once when the menu page is opened.
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:3000/products");

        if (!response.ok) {
          throw new Error("Failed to fetch menu products.");
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching menu products:", error);
        setErrorMessage("Unable to load menu right now.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Define the display order of categories on the menu page.
  const categories = [
    "Fresh Juices",
    "Smoothies",
    "Milkshakes",
    "Fruit Salads",
    "Ice Cream",
  ];

  // Render one menu section for a given category.
  // Only products that belong to the current category will be displayed.
  function renderSection(categoryName) {
    const items = products.filter(
      (product) => product.category === categoryName
    );

    // Do not render empty categories.
    if (items.length === 0) return null;

    return (
      <section className="menu-section" key={categoryName}>
        <h2>{categoryName}</h2>
        <div className="products-grid">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <Navbar />

      <section className="menu-hero">
        <div className="container">
          <h1>Our Fresh Menu</h1>
          <p>Healthy choices for the whole family.</p>
        </div>
      </section>

      <main className="container menu-page">
        {/* Display a loading message while menu items are being fetched. */}
        {loading && <p>Loading menu...</p>}

        {/* Display an error message if the product request fails. */}
        {!loading && errorMessage && <p>{errorMessage}</p>}

        {/* Display a fallback message if no products are returned from the API. */}
        {!loading && !errorMessage && products.length === 0 && (
          <p>No products found.</p>
        )}

        {/* Render all menu categories and their products once data is available. */}
        {!loading && !errorMessage && products.length > 0 && (
          <>{categories.map((category) => renderSection(category))}</>
        )}
      </main>

      <footer className="footer">
        <p>© 2026 KeyTop Fresh. All Rights Reserved.</p>
      </footer>
    </>
  );
}

export default Menu;

