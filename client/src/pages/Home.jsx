import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

// Static customer reviews displayed in the homepage review slider.
const reviews = [
  {
    text: "Absolutely the freshest juice I've ever had! The mango blend is incredible.",
    author: "Emily R.",
  },
  {
    text: "I love the fruit salads here. Everything tastes natural and high quality.",
    author: "Daniel K.",
  },
  {
    text: "The pistachio sauce on the ice cream is amazing. Highly recommended!",
    author: "Sophia L.",
  },
  {
    text: "Great atmosphere and very friendly staff. My go-to place every weekend!",
    author: "Michael T.",
  },
];

function Home() {
  // Store products marked as featured in the mock backend.
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Control loading and error states while fetching featured products.
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Track the currently visible customer review in the slider.
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Fetch featured products when the homepage loads.
  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const response = await fetch("http://localhost:3001/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }

        const data = await response.json();

        // Keep only products explicitly marked as featured.
        const filteredFeaturedProducts = data.filter(
          (product) => product.featured === true
        );

        setFeaturedProducts(filteredFeaturedProducts);
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setErrorMessage("Unable to load best sellers right now.");
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, []);

  // Rotate customer reviews automatically every 4 seconds.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />

      <main className="home-page">
        {/* Hero section introducing the store and linking users to the menu page. */}
        <section className="hero">
          <div className="hero-overlay"></div>

          <div className="hero-content container">
            <h1>Fresh Energy In Every Sip</h1>
            <p>
              Natural juices, smoothies and desserts made daily with real
              ingredients.
            </p>
            <Link to="/menu" className="btn-primary">
              Explore Menu
            </Link>
          </div>
        </section>

        {/* Featured products section showing best sellers from the API. */}
        <section className="featured container">
          <h2>Our Best Sellers</h2>

          {/* Loading, error, and empty-state messages for featured products. */}
          {loading && <p>Loading best sellers...</p>}

          {!loading && errorMessage && <p>{errorMessage}</p>}

          {!loading && !errorMessage && featuredProducts.length === 0 && (
            <p>No featured products found.</p>
          )}

          {/* Render all featured products using the shared ProductCard component. */}
          {!loading && !errorMessage && featuredProducts.length > 0 && (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Review slider section showing one review at a time. */}
        <section className="reviews-section">
          <div className="container">
            <h2>Customer Reviews</h2>

            <div className="review-slider">
              <div className="review-text">
                "{reviews[currentReviewIndex].text}"
              </div>
              <div className="review-author">
                - {reviews[currentReviewIndex].author}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 KeyTop Fresh. All Rights Reserved.</p>
      </footer>
    </>
  );
}

export default Home;

